import React, { Component } from 'react';
import {
    Alert, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';

import Item from './item';
import styles from './style';

const SubmitButton = ({
    customStyles, disableBtn, extraBtnOpacityProps, floatSubmitBtn, onSubmit,
    selectedItem, submitBtnTitle, multiselect, submitBtnWidth,
}) => {
    const {
        btn, btnOpacity, btnTxt, disabledBtnOpacity, disabledBtn, disabledBtnTxt,
    } = customStyles;
    const { buttonText, buttonView, submitOpacity } = styles;
    const opacityStyle = [
        submitOpacity,
        floatSubmitBtn && { position: 'absolute' },
        disableBtn && { opacity: 0.7, ...disabledBtnOpacity },
        submitBtnWidth && { marginHorizontal: `${(100 - submitBtnWidth) / 2}%` },
        btnOpacity,
    ];
    const submitFunc = onSubmit || (() => {});
    let submitItem = selectedItem;

    if (multiselect) submitItem = selectedItem && selectedItem.map(obj => obj.item);

    return (
        <TouchableOpacity
            disabled={disableBtn}
            onPress={() => { submitFunc(submitItem); }}
            style={opacityStyle}
            {...extraBtnOpacityProps}
        >
            <View style={[buttonView, btn, disableBtn ? disabledBtn : {}]}>
                <Text style={[buttonText, btnTxt, disableBtn ? disabledBtnTxt : {}]}>
                    {submitBtnTitle}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

class ReactNativeItemSelect extends Component {
    static isDisabled(selectedItem, multiselect, minSelectCount) {
        return (multiselect && selectedItem && selectedItem.length < minSelectCount) || !selectedItem;
    }

    constructor(props) {
        super(props);
        const { data, countPerRow } = props;

        const { multiselect } = props;

        this.state = {
            formattedData: ReactNativeItemSelect.getChunks(data || [], countPerRow),
            indexMapping: {},
            selectedItem: multiselect && [],
        };
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        const { formattedData } = this.state;
        const { searchKey } = this.props;

        formattedData.forEach((chunkData, index) => {
            chunkData.forEach((item, chunkIndex) => {
                if (item.selected) {
                    const mapKey = searchKey ? item[searchKey] : `${index}_${chunkIndex}`;
                    this.onSelect(mapKey, false, item);
                }
            });
        });
    }

    componentDidUpdate(prevProps) {
        const { searchKey, data, countPerRow } = this.props;
        const { data: prevData } = prevProps;

        if (searchKey && data.length !== prevData.length) {
            this.setState({
                formattedData: ReactNativeItemSelect.getChunks(data || [], countPerRow),
            });
        }
    }

    onSelect(index, selected, item) {
        const newState = { ...this.state };
        const { indexMapping, selectedItem } = newState;
        let tempSelected = selectedItem;
        const { multiselect, maxSelectAlertTxt, maxSelectCount, onSelectedItemBtn } = this.props;

        if (multiselect && selectedItem.length === maxSelectCount && !selected) {
            return Alert.alert('', maxSelectAlertTxt || `You can't select more than ${maxSelectCount} items`);
        }

        if (!multiselect) Object.keys(indexMapping).forEach((i) => { indexMapping[i] = false; });

        indexMapping[index] = !selected;

        if (multiselect) {
            if (selected) tempSelected = tempSelected.filter(obj => obj.index !== index);
            else tempSelected.push({ index, item });
        } else {
            tempSelected = selected ? null : item;
        }

        newState.selectedItem = tempSelected;

        if (onSelectedItemBtn) onSelectedItemBtn(tempSelected);

        return this.setState(newState);
    }

    // Creates array of arrays for customizable grid layout
    static getChunks(data, chunk) {
        let i;
        let j;
        const tempArray = [];

        for (i = 0, j = data.length; i < j; i += chunk) {
            tempArray.push(data.slice(i, i + chunk));
        }

        return tempArray;
    }

    render() {
        const { isDisabled } = ReactNativeItemSelect;
        const {
            styles: customStyles, data, onSubmit, floatSubmitBtn, submitBtnTitle, searchKey,
            multiselect, minSelectCount, lastRowMargin, submitBtnWidth, extraBtnOpacityProps, itemComponent,
        } = this.props;
        const { selectedItem, formattedData } = this.state;
        const { container, itemWrapper } = styles;
        const { rowWrapper } = customStyles;
        const submitBtnProps = {
            customStyles,
            extraBtnOpacityProps,
            multiselect,
            floatSubmitBtn,
            onSubmit,
            selectedItem,
            submitBtnTitle,
            submitBtnWidth,
        };
        const renderSubmitBtn = () => (
            <SubmitButton
                disableBtn={isDisabled(selectedItem, multiselect, minSelectCount)}
                {...submitBtnProps}
            />
        );
        let extraMargin = {};

        return (
            <View style={container}>
                <ScrollView style={container}>
                    <View style={container}>
                        {
                            formattedData.map((chunkData, index) => {
                                const isLast = formattedData.length === (index + 1);

                                if (floatSubmitBtn && isLast) {
                                    extraMargin = { marginBottom: lastRowMargin };
                                }

                                return (
                                    <View key={String(index)} style={[itemWrapper, extraMargin, rowWrapper]}>
                                        {
                                            chunkData.map((item, chunkIndex) => {
                                                const mapKey = searchKey ? item[searchKey] : `${index}_${chunkIndex}`;
                                                const {
                                                    indexMapping: { [mapKey]: isSelected },
                                                } = this.state;

                                                return (
                                                    <Item
                                                        index={mapKey}
                                                        onSelect={this.onSelect}
                                                        key={String(chunkIndex)}
                                                        selected={isSelected}
                                                        item={item}
                                                        {...this.props}
                                                    />
                                                );
                                            })
                                        }
                                    </View>
                                );
                            })
                        }
                    </View>

                    { data && itemComponent && !floatSubmitBtn && renderSubmitBtn() }
                </ScrollView>

                { data && itemComponent && floatSubmitBtn && renderSubmitBtn() }
            </View>
        );
    }
}

ReactNativeItemSelect.propTypes = {
    data: PropTypes.instanceOf(Array).isRequired,
    onSelectedItemBtn: PropTypes.func,
    itemComponent: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    countPerRow: PropTypes.number,
    extraItemHighlighProps: PropTypes.instanceOf(Object),
    extraBtnOpacityProps: PropTypes.instanceOf(Object),
    floatSubmitBtn: PropTypes.bool,
    lastRowMargin: PropTypes.number,
    maxSelectAlertTxt: PropTypes.string,
    maxSelectCount: PropTypes.number,
    minSelectCount: PropTypes.number,
    multiselect: PropTypes.bool,
    styles: PropTypes.shape({
        btn: PropTypes.instanceOf(Object),
        disabledBtn: PropTypes.instanceOf(Object),
        btnOpacity: PropTypes.instanceOf(Object),
        disabledBtnOpacity: PropTypes.instanceOf(Object),
        btnTxt: PropTypes.instanceOf(Object),
        disabledBtnTxt: PropTypes.instanceOf(Object),
        itemBoxHighlight: PropTypes.instanceOf(Object),
        activeItemBoxHighlight: PropTypes.instanceOf(Object),
        itemComponentWrapper: PropTypes.instanceOf(Object),
        tickTxt: PropTypes.instanceOf(Object),
        rowWrapper: PropTypes.instanceOf(Object),
    }),
    searchKey: PropTypes.string,
    submitBtnTitle: PropTypes.string,
    submitBtnWidth: PropTypes.number,
    tickPosition: PropTypes.oneOf([
        'topLeft',
        'topRight',
        'topMiddle',
        'bottomLeft',
        'bottomRight',
        'bottomMiddle',
        'middle',
        'leftMiddle',
        'rightMiddle']),
    tickStyle: PropTypes.oneOf(['check', 'overlayCheck']),
    tickTxt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Object),
    ]),
    tickComponent: PropTypes.node,
};

ReactNativeItemSelect.defaultProps = {
    countPerRow: 2,
    extraItemHighlighProps: {},
    extraBtnOpacityProps: {},
    floatSubmitBtn: false,
    lastRowMargin: 50,
    maxSelectAlertTxt: null,
    maxSelectCount: null,
    minSelectCount: 1,
    multiselect: false,
    styles: {},
    searchKey: null,
    submitBtnTitle: 'Submit',
    submitBtnWidth: 100,
    tickPosition: null,
    tickStyle: null,
    tickTxt: <Text>&#x2713;</Text>,
    tickComponent: null,
};

export default ReactNativeItemSelect;

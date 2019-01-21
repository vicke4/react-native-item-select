import React, { PureComponent } from 'react';
import {
    Text, TouchableHighlight, View,
} from 'react-native';

import styles from './style';

const positionMapping = {
    topRight: { right: 0 },
    topMiddle: { left: 0, right: 0 },
    bottomLeft: { bottom: 0 },
    bottomRight: { bottom: 0, right: 0 },
    bottomMiddle: { bottom: 0, left: 0, right: 0 },
    leftMiddle: { top: 0, bottom: 0 },
    rightMiddle: { top: 0, bottom: 0, right: 0 },
    middle: {
        top: 0, bottom: 0, left: 0, right: 0,
    },
};

const CheckMark = ({
    customTickTxt, textStyle, tickPos, tickComponent,
}) => {
    const { tickTxt } = styles;
    const viewStyle = {
        position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 1,
    };
    const textContent = customTickTxt;

    return (
        <View style={{ ...viewStyle, ...positionMapping[tickPos] }}>
            {
                tickComponent || (
                    <Text style={[tickTxt, textStyle]}>
                        {textContent}
                    </Text>
                )
            }
        </View>
    );
};

class Item extends PureComponent {
    constructor(props) {
        super(props);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect() {
        const {
            index, onSelect, item, selected,
        } = this.props;

        onSelect(index, selected, item);
    }

    render() {
        const {
            extraItemHighlighProps, item, itemComponent, index, tickPosition,
            tickStyle, tickTxt, multiselect, styles: customStyles, selected, tickComponent,
        } = this.props;
        const renderFunc = itemComponent || (() => {});
        const {
            itemBoxHighlight, itemComponentWrapper, activeItemBoxHighlight, tickTxt: textStyle,
        } = customStyles;
        const { itemTouchableHighlight } = styles;
        const borderColor = selected ? 'green' : '#CECECE';
        const highlightStyle = [itemTouchableHighlight];
        const tickPos = tickPosition || (tickStyle === 'overlayCheck' || multiselect ? 'middle' : 'topRight');
        const tickProps = {
            textStyle, customTickTxt: tickTxt, tickPos, tickStyle, tickComponent,
        };

        highlightStyle.push({ borderColor }, { marginBottom: 10 }, itemBoxHighlight);
        highlightStyle.push(multiselect && tickStyle !== 'check' && selected && { backgroundColor: '#cdcdcd' });

        if (selected) highlightStyle.push(activeItemBoxHighlight);

        return (
            <TouchableHighlight
                underlayColor="#ddd"
                onPress={this.handleSelect}
                key={index}
                style={highlightStyle}
                {...extraItemHighlighProps}
            >
                <View style={[{ padding: 5 }, itemComponentWrapper]}>
                    <View>
                        {selected && <CheckMark {...tickProps} />}
                        {renderFunc(item, selected)}
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}

export default Item;

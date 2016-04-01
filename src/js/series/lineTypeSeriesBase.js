/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    renderUtil = require('../helpers/renderUtil');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * Make positions of line chart.
     * @returns {Array.<Array.<object>>} positions
     * @private
     */
    _makeBasicPositions: function() {
        var dimension = this.boundsMaker.getDimension('series'),
            itemGroup = this.dataProcessor.getItemGroup(),
            width = dimension.width,
            height = dimension.height,
            len = itemGroup.getGroupCount(this.chartType),
            start = chartConst.SERIES_EXPAND_SIZE,
            step;

        if (this.data.aligned) {
            step = width / (len - 1);
        } else {
            step = width / len;
            start += (step / 2);
        }

        return itemGroup.map(function(items) {
            return items.map(function(item, index) {
                return {
                    left: start + (step * index),
                    top: height - (item.ratio * height) + chartConst.SERIES_EXPAND_SIZE
                };
            });
        }, this.chartType, true);
    },

    /**
     * Make label position top.
     * @param {{top: number, startTop: number}} position position
     * @param {number} value value
     * @param {number} labelHeight label height
     * @returns {number} position top
     * @private
     */
    _makeLabelPositionTop: function(position, value, labelHeight) {
        var positionTop;

        if (this.options.stacked && position.startTop) {
            positionTop = (position.startTop + position.top - labelHeight) / 2 + 1;
        } else if (value < 0 && !tui.util.isUndefined(position.startTop)) {
            positionTop = position.top + chartConst.SERIES_LABEL_PADDING;
        } else {
            positionTop = position.top - labelHeight - chartConst.SERIES_LABEL_PADDING;
        }

        return positionTop;
    },

    /**
     * Render series label.
     * @param {HTMLElement} elSeriesLabelArea series label area element
     * @private
     */
    _renderSeriesLabel: function(elSeriesLabelArea) {
        var self = this,
            groupPositions = this.seriesData.groupPositions,
            itemGroup = this.dataProcessor.getItemGroup(),
            firstFormattedValue = this.dataProcessor.getFirstFormattedValue(this.chartType),
            labelHeight = renderUtil.getRenderedLabelHeight(firstFormattedValue, this.theme.label),
            htmls;

        htmls = itemGroup.map(function(items, groupIndex) {
            return items.map(function(item, index) {
                var position = groupPositions[groupIndex][index],
                    labelHtml = '',
                    labelWidth;

                if (position.top !== position.startTop) {
                    labelWidth = renderUtil.getRenderedLabelWidth(item.formattedValue, self.theme.label);
                    labelHtml = self._makeSeriesLabelHtml({
                        left: position.left - (labelWidth / 2),
                        top: self._makeLabelPositionTop(position, item.formattedValue, labelHeight)
                    }, item.formattedValue, groupIndex);
                }
                return labelHtml;
            }).join('');
        }, this.chartType, true);

        elSeriesLabelArea.innerHTML = htmls.join('');
    },

    /**
     * Whether changed or not.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(groupIndex, index) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = {
            groupIndex: groupIndex,
            index: index
        };

        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);
    },

    /**
     * To call showGroupTooltipLine function of graphRenderer.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupTooltipLine: function(bound) {
        if (!this.graphRenderer.showGroupTooltipLine) {
            return;
        }
        this.graphRenderer.showGroupTooltipLine(bound);
    },

    /**
     * To call hideGroupTooltipLine function of graphRenderer.
     */
    onHideGroupTooltipLine: function() {
        if (!this.graphRenderer.hideGroupTooltipLine) {
            return;
        }
        this.graphRenderer.hideGroupTooltipLine();
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;
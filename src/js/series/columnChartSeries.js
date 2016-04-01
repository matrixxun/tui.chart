/**
 * @fileoverview Column chart series component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    BarTypeSeriesBase = require('./barTypeSeriesBase'),
    chartConst = require('../const'),
    predicate = require('../helpers/predicate'),
    renderUtil = require('../helpers/renderUtil'),
    calculator = require('../helpers/calculator');

var ColumnChartSeries = tui.util.defineClass(Series, /** @lends ColumnChartSeries.prototype */ {
    /**
     * Column chart series component.
     * @constructs ColumnChartSeries
     * @extends Series
     * @param {object} params parameters
     *      @param {object} params.model series model
     *      @param {object} params.options series options
     *      @param {object} params.theme series theme
     */
    init: function() {
        Series.apply(this, arguments);
    },

    /**
     * Make bound of column chart.
     * @param {number} width width
     * @param {number} height height
     * @param {number} left top position value
     * @param {number} startTop start top position value
     * @param {number} endTop end top position value
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }} column chart bound
     * @private
     */
    _makeBound: function(width, height, left, startTop, endTop) {
        return {
            start: {
                top: startTop,
                left: left,
                width: width,
                height: 0
            },
            end: {
                top: endTop,
                left: left,
                width: width,
                height: height
            }
        };
    },

    /**
     * Make column chart bound.
     * @param {{
     *      baseSize: number,
     *      basePosition: number,
     *      step: number,
     *      additionalPosition: ?number,
     *      barSize: number
     * }} baseData base data for making bound
     * @param {{
     *      baseLeft: number,
     *      left: number,
     *      plusTop: number,
     *      minusTop: number,
     *      prevStack: ?string
     * }} iterationData iteration data
     * @param {?boolean} isStacked whether stacked option or not.
     * @param {{value: number, ratio: number, stack: string}} item item
     * @param {number} index index
     * @returns {{
     *      start: {left: number, top: number, width: number, height: number},
     *      end: {left: number, top: number, width: number, height: number}
     * }}
     * @private
     */
    _makeColumnChartBound: function(baseData, iterationData, isStacked, item, index) {
        var barHeight = Math.abs(baseData.baseBarSize * item.ratioDistance),
            barStartTop = baseData.baseBarSize * item.startRatio,
            startTop = baseData.basePosition - barStartTop + chartConst.SERIES_EXPAND_SIZE,
            changedStack = (item.stack !== iterationData.prevStack),
            stepCount, endTop, bound;

        if (!isStacked || (!this.options.diverging && changedStack)) {
            stepCount = isStacked ? this.dataProcessor.findStackIndex(item.stack) : index;
            iterationData.left = (baseData.step * stepCount) + iterationData.baseLeft + baseData.additionalPosition;
            iterationData.plusTop = 0;
            iterationData.minusTop = 0;
        }

        if (item.value >= 0) {
            iterationData.plusTop -= barHeight;
            endTop = startTop + iterationData.plusTop;
        } else {
            endTop = startTop + iterationData.minusTop;
            iterationData.minusTop += barHeight;
        }

        iterationData.prevStack = item.stack;

        bound = this._makeBound(baseData.barSize, barHeight, iterationData.left, startTop, endTop);

        return bound;
    },

    /**
     * Make bounds of column chart.
     * @returns {Array.<Array.<object>>} bounds
     * @private
     */
    _makeBounds: function() {
        var self = this,
            itemGroup = this.dataProcessor.getItemGroup(),
            isStacked = predicate.isValidStackedOption(this.options.stacked),
            dimension = this.boundsMaker.getDimension('series'),
            baseData = this._makeBaseDataForMakingBound(dimension.width, dimension.height);

        return itemGroup.map(function(items, groupIndex) {
            var baseLeft = (groupIndex * baseData.groupSize) + baseData.firstAdditionalPosition
                        + chartConst.SERIES_EXPAND_SIZE,
                iterationData = {
                    baseLeft: baseLeft,
                    left: baseLeft,
                    plusTop: 0,
                    minusTop: 0,
                    prevStack: null
                },
                iteratee = tui.util.bind(self._makeColumnChartBound, self, baseData, iterationData, isStacked);

            return items.map(iteratee);
        }, this.chartType);
    },

    /**
     * Make series rendering position
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {number} value - value
     * @param {string} formattedValue - formatted value
     * @param {?boolean} isStart - whether start or not
     * @returns {{left: number, top: number}} rendering position
     */
    makeSeriesRenderingPosition: function(bound, labelHeight, value, formattedValue, isStart) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedValue, this.theme.label),
            top = bound.top,
            left = bound.left + (bound.width - labelWidth) / 2;

        if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: top
        };
    },

    /**
     * Calculate left position of sum label.
     * @param {{left: number, top: number}} bound bound
     * @param {string} formattedSum formatted sum.
     * @returns {number} left position value
     * @private
     */
    _calculateLeftPositionOfSumLabel: function(bound, formattedSum) {
        var labelWidth = renderUtil.getRenderedLabelWidth(formattedSum, this.theme.label);
        return bound.left + ((bound.width - labelWidth + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make plus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @param {number} labelHeight label height
     * @returns {string} plus sum label html
     * @private
     */
    _makePlusSumLabelHtml: function(values, bound, labelHeight) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumPlusValues(values);
            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top - labelHeight - chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    },

    /**
     * Make minus sum label html.
     * @param {Array.<number>} values values
     * @param {{left: number, top: number}} bound bound
     * @returns {string} plus minus label html
     * @private
     */
    _makeMinusSumLabelHtml: function(values, bound) {
        var sum, formattedSum,
            html = '';

        if (bound) {
            sum = calculator.sumMinusValues(values);

            if (this.options.diverging) {
                sum = Math.abs(sum);
            }

            formattedSum = renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions());
            html = this._makeSeriesLabelHtml({
                left: this._calculateLeftPositionOfSumLabel(bound, formattedSum),
                top: bound.top + bound.height + chartConst.SERIES_LABEL_PADDING
            }, formattedSum, -1);
        }

        return html;
    }
});

BarTypeSeriesBase.mixin(ColumnChartSeries);

module.exports = ColumnChartSeries;
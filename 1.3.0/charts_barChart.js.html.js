ne.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_barChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Bar chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar ChartBase = require('./chartBase'),\n    axisTypeMixer = require('./axisTypeMixer'),\n    axisDataMaker = require('../helpers/axisDataMaker'),\n    Series = require('../series/barChartSeries');\n\nvar BarChart = tui.util.defineClass(ChartBase, /** @lends BarChart.prototype */ {\n    /**\n     * Bar chart.\n     * @constructs BarChart\n     * @extends ChartBase\n     * @mixes axisTypeMixer\n     * @param {array.&lt;array>} userData chart data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     */\n    init: function(userData, theme, options) {\n        /**\n         * className\n         * @type {string}\n         */\n        this.className = 'tui-bar-chart';\n\n        ChartBase.call(this, {\n            userData: userData,\n            theme: theme,\n            options: options,\n            hasAxes: true\n        });\n\n        this._addComponents(this.convertedData, options.chartType);\n    },\n\n    /**\n     * To make axes data\n     * @param {object} convertedData converted data\n     * @param {object} bounds chart bounds\n     * @param {object} options chart options\n     * @returns {object} axes data\n     * @private\n     */\n    _makeAxesData: function(convertedData, bounds, options) {\n        var xAxisData = axisDataMaker.makeValueAxisData({\n                values: convertedData.values,\n                seriesDimension: bounds.series.dimension,\n                stacked: options.series &amp;&amp; options.series.stacked || '',\n                chartType: options.chartType,\n                formatFunctions: convertedData.formatFunctions,\n                options: options.xAxis\n            }),\n            yAxisData = axisDataMaker.makeLabelAxisData({\n                labels: convertedData.labels,\n                isVertical: true\n            });\n\n        return {\n            xAxis: xAxisData,\n            yAxis: yAxisData\n        };\n    },\n\n    /**\n     * Add components\n     * @param {object} convertedData converted data\n     * @param {string} chartType chart type\n     * @private\n     */\n    _addComponents: function(convertedData, chartType) {\n        var seriesData = {\n            allowNegativeTooltip: true,\n            data: {\n                values: convertedData.values,\n                formattedValues: convertedData.formattedValues,\n                formatFunctions: convertedData.formatFunctions,\n                joinLegendLabels: convertedData.joinLegendLabels\n            }\n        };\n\n        this._addComponentsForAxisType({\n            convertedData: convertedData,\n            axes: ['yAxis', 'xAxis'],\n            chartType: chartType,\n            serieses: [\n                {\n                    name: 'series',\n                    SeriesClass: Series,\n                    data: seriesData\n                }\n            ]\n        });\n    }\n});\n\naxisTypeMixer.mixin(BarChart);\n\nmodule.exports = BarChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"
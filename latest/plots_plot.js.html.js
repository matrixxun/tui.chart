tui.util.defineNamespace("fedoc.content", {});
fedoc.content["plots_plot.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Plot component.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar dom = require('../helpers/domHandler'),\n    calculator = require('../helpers/calculator'),\n    renderUtil = require('../helpers/renderUtil'),\n    plotTemplate = require('./plotTemplate');\n\nvar Plot = tui.util.defineClass(/** @lends Plot.prototype */ {\n    /**\n     * Plot component.\n     * @constructs Plot\n     * @param {object} params parameters\n     *      @param {number} params.vTickCount vertical tick count\n     *      @param {number} params.hTickCount horizontal tick count\n     *      @param {object} params.theme axis theme\n     */\n    init: function(params) {\n        /**\n         * Plot view className\n         * @type {string}\n         */\n        this.className = 'tui-chart-plot-area';\n\n        /**\n         * Bounds maker\n         * @type {BoundsMaker}\n         */\n        this.boundsMaker = params.boundsMaker;\n\n        /**\n         * Options\n         * @type {object}\n         */\n        this.options = params.options || {};\n\n        /**\n         * Theme\n         * @type {object}\n         */\n        this.theme = params.theme || {};\n\n        /**\n         * Plot data.\n         * @type {object}\n         */\n        this.data = {};\n    },\n\n    /**\n     * Render plot area.\n     * @param {HTMLElement} plotContainer plot area element\n     * @param {object} data rendering data\n     * @private\n     */\n    _renderPlotArea: function(plotContainer, data) {\n        var dimension = this.boundsMaker.getDimension('plot');\n        this.data = data;\n\n        renderUtil.renderDimension(plotContainer, dimension);\n        renderUtil.renderPosition(plotContainer, this.boundsMaker.getPosition('plot'));\n\n        if (!this.options.hideLine) {\n            this._renderLines(plotContainer, dimension);\n        }\n    },\n\n    /**\n     * Render plot component.\n     * @param {object} data rendering data\n     * @returns {HTMLElement} plot element\n     */\n    render: function(data) {\n        var el = dom.create('DIV', this.className);\n        this._renderPlotArea(el, data);\n        this.plotContainer = el;\n        return el;\n    },\n\n    /**\n     * Rerender.\n     * @param {object} data rendering\n     */\n    rerender: function(data) {\n        this.plotContainer.innerHTML = '';\n        this._renderPlotArea(this.plotContainer, data);\n    },\n\n    /**\n     * Resize plot component.\n     * @param {object} data rendering data\n     */\n    resize: function(data) {\n        this.rerender(data);\n    },\n\n    /**\n     * Render plot lines.\n     * @param {HTMLElement} el element\n     * @param {{width: number, height: number}} dimension plot area dimension\n     * @private\n     */\n    _renderLines: function(el, dimension) {\n        var hPositions = this._makeHorizontalPixelPositions(dimension.width),\n            vPositions = this._makeVerticalPixelPositions(dimension.height),\n            theme = this.theme,\n            lineHtml = '';\n\n        lineHtml += this._makeLineHtml({\n            positions: hPositions,\n            size: dimension.height,\n            className: 'vertical',\n            positionType: 'left',\n            sizeType: 'height',\n            lineColor: theme.lineColor\n        });\n        lineHtml += this._makeLineHtml({\n            positions: vPositions,\n            size: dimension.width,\n            className: 'horizontal',\n            positionType: 'bottom',\n            sizeType: 'width',\n            lineColor: theme.lineColor\n        });\n\n        el.innerHTML = lineHtml;\n\n        renderUtil.renderBackground(el, theme.background);\n    },\n\n    /**\n     * Make html of plot line.\n     * @param {object} params parameters\n     *      @param {Array.&lt;object>} params.positions positions\n     *      @param {number} params.size width or height\n     *      @param {string} params.className line className\n     *      @param {string} params.positionType position type (left or bottom)\n     *      @param {string} params.sizeType size type (size or height)\n     *      @param {string} params.lineColor line color\n     * @returns {string} html\n     * @private\n     */\n    _makeLineHtml: function(params) {\n        var template = plotTemplate.tplPlotLine,\n            lineHtml = tui.util.map(params.positions, function(position) {\n                var cssTexts = [\n                        renderUtil.concatStr(params.positionType, ':', position, 'px'),\n                        renderUtil.concatStr(params.sizeType, ':', params.size, 'px')\n                    ], data;\n\n                if (params.lineColor) {\n                    cssTexts.push(renderUtil.concatStr('background-color:', params.lineColor));\n                }\n\n                data = {className: params.className, cssText: cssTexts.join(';')};\n                return template(data);\n            }).join('');\n        return lineHtml;\n    },\n\n    /**\n     * Make pixel value of vertical positions\n     * @param {number} height plot height\n     * @returns {Array.&lt;number>} positions\n     * @private\n     */\n    _makeVerticalPixelPositions: function(height) {\n        var positions = calculator.makeTickPixelPositions(height, this.data.vTickCount);\n        positions.shift();\n        return positions;\n    },\n\n    /**\n     * Make divided positions of plot.\n     * @param {number} width plot width\n     * @returns {Array.&lt;number>}\n     * @private\n     */\n    _makeDividedPlotPositions: function(width) {\n        var tickCount = parseInt(this.data.hTickCount / 2, 10) + 1,\n            yAxisWidth = this.boundsMaker.getDimension('yAxis').width,\n            leftWidth, rightWidth, leftPositions, rightPositions;\n\n        width -= yAxisWidth;\n        leftWidth = Math.round((width) / 2);\n        rightWidth = width - leftWidth;\n\n        leftPositions = calculator.makeTickPixelPositions(leftWidth, tickCount);\n        rightPositions = calculator.makeTickPixelPositions(rightWidth, tickCount, leftWidth + yAxisWidth);\n\n        leftPositions.pop();\n        rightPositions.shift();\n\n        return leftPositions.concat(rightPositions);\n    },\n\n    /**\n     * Make pixel value of horizontal positions.\n     * @param {number} width plot width\n     * @returns {Array.&lt;number>} positions\n     * @private\n     */\n    _makeHorizontalPixelPositions: function(width) {\n        var positions;\n\n        if (this.options.divided) {\n            positions = this._makeDividedPlotPositions(width);\n        } else {\n            positions = calculator.makeTickPixelPositions(width, this.data.hTickCount);\n            positions.shift();\n        }\n        return positions;\n    }\n});\n\nmodule.exports = Plot;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"
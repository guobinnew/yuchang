// Copyright 2018 Unique. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import $ from 'jquery'
import * as d3 from 'd3'
import yuchg from './base'
import logger from './logger'
import BlockDefs from './blockDefs/index'
import ShapeUtils from './shapes'
import Utils from './utils'
import Blocks from './blocks'
import Argument from './argus'

/**
 * 查找类目上下文
 * category: string 类目名称
 */
function acquireCategoryContext(category) {
  if (BlockDefs.categories) {
    return BlockDefs.categories[category]
  }
  return null
}

const ycMinZoom = 0.5
const ycMaxZoom = 2
/**
 * 编辑面板，提供可视化编辑UI
 */
class Panel {
  constructor(node) {
    this.registries = {} // block注册列表
    this.instances = {} // block实例数组

    this.grapPoint = {
      x: 0,
      y: 0
    }
    this.lastPoint = {
      x: 0,
      y: 0
    }

    this.selected = null
    this.zoomRate = 1.2
    this.currentZoomFactor = 1.0 / this.zoomRate
    this.startDrag = false

    this.flyoutgrapPoint = {
      x: 0,
      y: 0
    }
    this.flyoutlastPoint = {
      x: 0,
      y: 0
    }
    this.flyoutselected = null
    this.flyoutstartDrag = false
    this.flyoutZoomFactor = 0.5
    this.flyoutHeight = 0

    this.option = {
      width: 800,
      height: 600,
      backgroundColor: '#ddd',
      blocks: BlockDefs,
      flyout: {
        width: 250
      },
      buttons: [{
          id: 'zoomout',
          img: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cuc2ZvbnQuY24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5zZm9udC5jbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTQ0MjkuNCw0OTgzLjdjLTE5MDMuOS0yNDEtMzQ3Ni45LTE1MjQuOC00MDc5LjQtMzMyNy45QzU0LjMsNzcwLjcsMTkuMy0yMDguNiwyNTMuNy0xMTExLjNjNDg4LjYtMTkwMy44LDIwNzIuNS0zMzMwLjEsNDAzMS4yLTM2MzYuOGMzNDguMy01Mi42LDEwOTMuMi01Mi42LDE0NDEuNiwwQzczMzAuMS00NDk2LjEsODcxMi41LTM0ODQsOTQwOS4yLTIwNDlDOTc2NC4yLTEzMTcuMiw5OTAwLTcxNC43LDk5MDAsMTA5YzAsNTIxLjQtMzAuNyw3ODguNy0xNDAuMiwxMjE4LjFjLTQ4OC42LDE4OTUuMS0yMDcyLjUsMzMzMC4xLTQwMDkuMywzNjM0LjZDNTQzNSw1MDEyLjEsNDczNCw1MDIzLjEsNDQyOS40LDQ5ODMuN3ogTTU0MjQuMSw0NTEyLjZjODA2LjItODEuMSwxNTc3LjQtMzc5LDIyMjUuOS04NjFjOTkyLjUtNzQwLjUsMTYzMi4yLTE4NzcuNiwxNzU5LjItMzEyNC4yYzExNi4xLTExNTguOS0yNTguNS0yMzUzLTEwMjcuNS0zMjY4LjhDNzQ2MS42LTM4NDEuMSw2MDA2LjgtNDQzNyw0NTg3LjItNDI5NC42QzI4MzguOS00MTE3LjEsMTM2Mi4zLTI5NDIuOCw4MTIuMy0xMjkwLjlDMzQzLjUsMTIwLDU5NS41LDE2MDcuNiwxNTA2LjgsMjgxNC43YzE3MC45LDIyNS43LDU2Ny40LDYyMi4yLDc5My4xLDc5My4xQzMyMTcuOSw0MzAyLjMsNDMyNC4zLDQ2MjIuMiw1NDI0LjEsNDUxMi42eiIvPjxwYXRoIGQ9Ik00MjgyLjcsMjM1Mi41QzM1NDguNywyMTk2LjksMjk3Mi41LDE2MTQuMSwyODI1LjcsODc4Yy01OS4yLTI4Ny0zNy4zLTY3Mi42LDUwLjQtOTQ0LjJjMTczLjEtNTMwLjIsNjAyLjUtOTkwLjMsMTA5OS44LTExODAuOWM1NTQuMy0yMTQuNywxMTYzLjMtMTY2LjUsMTY2Mi45LDEyNy4xbDExOC4zLDcwLjFsNTcxLjgtNTY5LjZjNjE3LjgtNjEzLjQsNjIwLTYxNS42LDgyMy44LTU4Ny4xYzI0MSwzMC43LDM3OSwzMTUuNSwyNjUuMSw1MzYuOGMtMjQuMSw0My44LTI4OS4yLDMyNi40LTU4OS4zLDYyNC40TDYyODIuOS01MDBsODMuMiwxNjIuMWMyMTYuOSw0MzMuOCwyNTQuMiw5OTAuMyw5OC42LDE0NTAuM0M2MjUwLDE3NDEuMiw1NzA4LjksMjIyMSw1MDY3LDIzNTIuNUM0ODYxLDIzOTQuMSw0NDc3LjYsMjM5Ni4zLDQyODIuNywyMzUyLjV6IE01MTE5LjYsMTcwMS44YzUwMS43LTE5Mi44LDgyNi02NjEuNiw4MjguMS0xMTkxLjhjMC0yMTYuOS0zMi45LTM1OS4zLTEzMy42LTU2OS42Yy0yNTEuOS01MjUuOC04NjEtODEwLjYtMTQ0MS42LTY3NC44Yy00MzYsMTAzLTgxNy4yLDQ3OS44LTkzMy4zLDkyMi4zYy00My44LDE2NC4zLTQxLjYsNDYwLjEsMi4yLDYzMWMxMTMuOSw0NDAuNCw0NjYuNyw3OTcuNSw5MTMuNiw5MjIuNEM0NTQxLjIsMTc5My44LDQ5MzUuNSwxNzc0LjEsNTExOS42LDE3MDEuOHoiLz48cGF0aCBkPSJNMzkxOSw2MzkuMmMtOTguNi03OC45LTEyNy4xLTIzNC40LTYxLjMtMzMwLjhjNzIuMy0xMDMsMTM1LjgtMTExLjcsODE5LjQtMTExLjdjNzAzLjMsMCw3NTgsOC44LDgxOS40LDEyOS4zYzYxLjMsMTE2LjEsMzcuMiwyMzQuNC02MS4zLDMxMy4zYy00MS42LDM1LTExNi4xLDM5LjQtNzU4LDM5LjRDNDAzNS4xLDY3OC42LDM5NjAuNiw2NzQuMywzOTE5LDYzOS4yeiIvPjwvZz48L2c+DQo8L3N2Zz4=',
          action: () => {
            this.zoomCanvas(this.currentZoomFactor / this.zoomRate)
          }
        },
        {
          id: 'zoomin',
          img: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cuc2ZvbnQuY24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5zZm9udC5jbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTQ0MjkuNyw0OTg2Yy04OTUuNi0xMDAuNy0xODUyLjUtNTEyLjQtMjU1MS0xMDk3Qy0zNTAuMywyMDI3LjctNTA4LTEzMDkuMywxNTM5LjQtMzM1NC40QzIwMjcuNy0zODQ0LjksMjY3OC00MjYxLDMzMTMtNDQ5NS4yYzI1Ni4yLTkyLDcwNS4xLTIwNS44LDEwMDcuMi0yNTEuOGMzMzkuNC01Mi42LDEwMzEuMy01Mi42LDEzNjguNSwwYzEyMTMuMSwxODguMywyMjk3LDc4OC4zLDMwNTksMTY5N2M3OTcsOTUyLjUsMTE4OSwyMDg2LjcsMTE0OS42LDMzMzAuNWMtMzIuOCwxMDEzLjgtMzUyLjUsMTkzMy41LTk1Ni45LDI3NDhjLTc5Ny4xLDEwNzUuMS0xOTg4LjIsMTc3NS44LTMzMTMsMTk0OC44QzUzNDkuNCw1MDEyLjMsNDcxMCw1MDE2LjYsNDQyOS43LDQ5ODZ6IE01NDkxLjcsNDUwNi40YzgyNS41LTk0LjIsMTYxMy44LTQyMi42LDIyNjYuMy05NDEuNmMyMjkuOS0xODMuOSw2MDQuMy01NjcuMSw3NzIuOS03OTIuN2MxMzI0LjctMTc3My42LDExNTQtNDIxOS41LTQwMC43LTU3NzYuM2MtNjgxLTY4My4yLTE1MjguNC0xMTEwLjItMjQ5Ni4yLTEyNjEuMmMtMzEzLjEtNDguMi05MzkuNC00OC4yLTEyNTkuMSwwYy0xMjc0LjQsMTk0LjktMjM0OS41LDg4MC4yLTMwNjcuNywxOTUzLjJDNzIwLjQtMTQzMS45LDQ3MC44LTI5NS41LDYzMC43LDc3My4xYzI4OSwxOTI5LjEsMTg0My43LDM0NTcuNSwzNzc5LjQsMzcyMC4yQzQ2ODMuNyw0NTMwLjUsNTIyMC4yLDQ1MzcuMSw1NDkxLjcsNDUwNi40eiIvPjxwYXRoIGQ9Ik00NDIxLDIzODAuM2MtMjA1LjgtMjguNS01MjEuMS0xMzUuOC02OTQuMS0yMzguN0MzMTA1LDE3NzMuOCwyNzUyLjQsMTExOSwyNzk0LDQwNS4yYzE3LjUtMjg5LDYxLjMtNDU3LjYsMTkwLjUtNzI3YzE4MS43LTM3Ni42LDQ2Ni40LTY2NS43LDg0My04NTRjMzA0LjQtMTUxLjEsNDg4LjMtMTkyLjcsODU0LTE5Mi43YzI2OS4zLDAsMzMwLjYsNi42LDUwMy42LDU5LjFjMTA5LjUsMzIuOCwyODAuMywxMDIuOSwzODEsMTU3LjdjMTAwLjcsNTIuNiwxODguMyw5Ni40LDE5NC45LDk2LjRjOC44LDAsMjU4LjQtMjQ3LjQsNTU0LTU0Ny40YzU0OS42LTU1Ni4yLDYxOS43LTYxMy4xLDc3MC44LTYxMy4xYzExMS43LDAsMjU4LjQsODcuNiwzMTUuMywxODguM2M1Ni45LDEwMC43LDY1LjcsMjY1LDE5LjcsMzU0LjdjLTE3LjUsMzIuOC0yODIuNCwzMDguNy01OTEuMiw2MTUuM2wtNTU2LjIsNTU2LjJsNjEuMywxMTEuN2MzNSw2MS4zLDk0LjEsMjA1LjgsMTMzLjYsMzE5LjdjNjEuMywxNzkuNiw3Mi4zLDI0Ny40LDgxLDQ5Mi43YzYuNiwyMTAuMiwwLDMzMC42LTI2LjMsNDU1LjRjLTE0Ni43LDcxOC4yLTY5OC41LDEyOTQuMS0xMzk5LjIsMTQ2MC41QzQ5MDQuOSwyMzkxLjIsNDYyMi40LDI0MDguOCw0NDIxLDIzODAuM3ogTTUwMjUuMywxNzM0LjNjNDM1LjctMTI5LjIsNzk5LjItNTE2LjgsODkzLjQtOTUyLjVjMzkuNC0xNzcuNCwxNy41LTUyNS41LTM5LjQtNjg1LjRjLTEzNy45LTM4MS00MzEuNC02NzAtODE0LjYtODAzLjZjLTE3My01OS4xLTUzNi41LTcwLjEtNzExLjYtMjEuOWMtNTU4LjQsMTU1LjUtOTUyLjUsNjY1LjctOTUyLjUsMTIyOC40QzM0MDIuOCwxMzUxLjEsNDIxNy4zLDE5NzAuOCw1MDI1LjMsMTczNC4zeiIvPjxwYXRoIGQ9Ik00NTU2LjcsMTI3NC41Yy05OC41LTUyLjUtMTI3LTEzNS44LTEyNy0zNzB2LTIwOGgtMTk3LjFjLTIzMi4xLDAtMzMyLjgtMzIuOC0zODEtMTI5LjJjLTU2LjktMTA5LjUtNDYtMTkyLjcsMzkuNC0yNzguMWw3NC40LTc0LjRoMjMyLjFoMjMyLjFWLTEwLjhjMC0yMjkuOSwyMS45LTI5Ny44LDEwNy4zLTM1NC43YzExNi4xLTc0LjUsMjY3LjEtNDYsMzMwLjYsNjEuM2MzNSw1Ni45LDQzLjgsMTExLjcsNDMuOCwyOTUuNnYyMjMuM2gyMzguN2MyMzguNywwLDI0MC45LDAsMzA2LjYsNjcuOWM1NC43LDUyLjUsNjcuOSw4NS40LDY3LjksMTU5LjhjMCwxODYuMS0xMTEuNywyNTQtNDE2LDI1NGgtMTk3LjFWOTIyYzAsMjQ3LjQtMTcuNSwyOTUuNi0xMzEuNCwzNTQuN0M0NzAxLjIsMTMxOC4zLDQ2MzMuMywxMzE2LjEsNDU1Ni43LDEyNzQuNXoiLz48L2c+PC9nPg0KPC9zdmc+',
          action: () => {
            this.zoomCanvas(this.currentZoomFactor * this.zoomRate)
          }
        },
        {
          id: 'reset',
          img: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cuc2ZvbnQuY24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5zZm9udC5jbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTQ1MzcuNyw0OTk3LjNjLTk0Ny4xLTk2LjYtMTg1MS4xLTQ2Mi4zLTI1ODYuNi0xMDQxLjZjLTE4Ny0xNDUuOS02NTEuMy02MTAuMi03OTcuMi03OTcuMkM2MjMuOSwyNDg0LjYsMjcwLjUsMTY2NC45LDEzNyw3ODcuNmMtNDkuMy0zMjYuNy00OS4zLTEwMjkuMywwLTEzNTZjMTMzLjUtODc3LjMsNDg0LjktMTY5NSwxMDE3LTIzNzAuOWMxNTguMi0yMDMuNCw2MzktNjc4LDgzNi4yLTgyOGM3MDYuOC01MzIuMSwxNDYyLjgtODUyLjYsMjMzMS45LTk4Ni4yYzMyNC42LTQ5LjMsMTAyNy4zLTQ5LjMsMTM1NiwwYzg2NC45LDEzMS41LDE2MjMuMSw0NTIsMjMzMS45LDk4Ni4yYzIxMS42LDE2MC4zLDcwNi44LDY1NS40LDg2Nyw4NjdDOTQxMS0yMTkxLjQsOTczMS41LTE0MzMuMyw5ODYzLTU2OC40YzQ5LjMsMzI4LjcsNDkuMywxMDMxLjQsMCwxMzU2Yy0xMzMuNSw4NjkuMS00NTQuMSwxNjI1LjEtOTg2LjIsMjMzMS45Yy0xNTAsMTk3LjItNjI0LjYsNjc4LTgyOCw4MzYuMmMtNjY5LjgsNTI4LTE0OTkuOCw4ODMuNC0yMzUwLjQsMTAxMi45QzU0MzUuNiw1MDA3LjYsNDc5MC40LDUwMjQsNDUzNy43LDQ5OTcuM3ogTTU0MzMuNSw0NDQ0LjZjODM4LjItODQuMiwxNjQ3LjctNDIxLjIsMjMxMS4zLTk1Ny40YzI0MC40LTE5My4xLDU1NC43LTUxOS44LDczOS42LTc2OC40YzE1MDYtMjAxMy40LDEwMDQuNy00ODYxLTExMDEuMi02MjUxLjlDNTY5NC40LTQ2NDYuNiwzNDUwLjktNDQzNywxOTg0LTMwMjUuNmMtMzgyLjEsMzY3LjctNjUzLjMsNzM3LjYtODg3LjUsMTIxNC4yQzEyMC41LDE2MSw3NjkuOCwyNTMxLjksMjYxNi44LDM3NTIuM0MzNDM0LjUsNDI5Mi42LDQ0NTMuNSw0NTQzLjIsNTQzMy41LDQ0NDQuNnoiLz48cGF0aCBkPSJNMzQyMC4xLDEwOTcuOGMtODAuMS04MC4xLTgwLjEtMzk2LjUsMC00NzYuN2MzNy0zNyw4OC4zLTM5LDE1NzkuOS0zOWMxNDkxLjYsMCwxNTQyLjksMi4xLDE1NzkuOSwzOWM4MC4xLDgwLjEsODAuMSwzOTYuNSwwLDQ3Ni43Yy0zNywzNy05NC41LDM5LTE1NzkuOSwzOUMzNTE0LjYsMTEzNi45LDM0NTcuMSwxMTM0LjgsMzQyMC4xLDEwOTcuOHoiLz48cGF0aCBkPSJNMzQzNC41LTQyNi42Yy0xMDIuNy01OS42LTEwMC43LTQ1Ni4xLDQuMS01MTEuNmMyNC43LTEyLjMsNTc3LjMtMjAuNSwxNTY5LjctMjAuNWMxNDgzLjMsMCwxNTM0LjcsMi4xLDE1NzEuNywzOWM4MC4xLDgwLjEsODAuMSwzOTYuNSwwLDQ3Ni43Yy0zNywzNy05NC41LDM5LTE1NzMuOCwzOUM0MDIyLjEtNDA0LDM0NTcuMS00MTIuMiwzNDM0LjUtNDI2LjZ6Ii8+PC9nPjwvZz4NCjwvc3ZnPg==',
          action: () => {
            this.resetCanvas()
          }
        },
        {
          id: 'save',
          img: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cuc2ZvbnQuY24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMDAwIDEwMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPG1ldGFkYXRhPiBTdmcgVmVjdG9yIEljb25zIDogaHR0cDovL3d3dy5zZm9udC5jbiA8L21ldGFkYXRhPg0KPGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTExLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSI+PHBhdGggZD0iTTQ1MzcuNyw0OTk3LjNjLTk0Ny4xLTk2LjYtMTg1MS4xLTQ2Mi4zLTI1ODYuNi0xMDQxLjZjLTE4Ny0xNDUuOS02NTEuMy02MTAuMi03OTcuMi03OTcuMkM2MjMuOSwyNDg0LjYsMjcwLjUsMTY2NC45LDEzNyw3ODcuNmMtNDkuMy0zMjYuNy00OS4zLTEwMjkuMywwLTEzNTZjMTMzLjUtODc3LjMsNDg0LjktMTY5NSwxMDE3LTIzNzAuOWMxNTguMi0yMDMuNCw2MzktNjc4LDgzNi4yLTgyOGM3MDYuOC01MzIuMSwxNDYyLjgtODUyLjYsMjMzMS45LTk4Ni4yYzMyNC42LTQ5LjMsMTAyNy4zLTQ5LjMsMTM1NiwwYzg2NC45LDEzMS41LDE2MjMuMSw0NTIsMjMzMS45LDk4Ni4yYzIxMS42LDE2MC4zLDcwNi44LDY1NS40LDg2Nyw4NjdDOTQxMS0yMTkxLjQsOTczMS41LTE0MzMuMyw5ODYzLTU2OC40YzQ5LjMsMzI4LjcsNDkuMywxMDMxLjQsMCwxMzU2Yy0xMzMuNSw4NjkuMS00NTQuMSwxNjI1LjEtOTg2LjIsMjMzMS45Yy0xNTAsMTk3LjItNjI0LjYsNjc4LTgyOCw4MzYuMmMtNjY5LjgsNTI4LTE0OTkuOCw4ODMuNC0yMzUwLjQsMTAxMi45QzU0MzUuNiw1MDA3LjYsNDc5MC40LDUwMjQsNDUzNy43LDQ5OTcuM3ogTTU0MzMuNSw0NDQ0LjZjODM4LjItODQuMiwxNjQ3LjctNDIxLjIsMjMxMS4zLTk1Ny40YzI0MC40LTE5My4xLDU1NC43LTUxOS44LDczOS42LTc2OC40YzE1MDYtMjAxMy40LDEwMDQuNy00ODYxLTExMDEuMi02MjUxLjlDNTY5NC40LTQ2NDYuNiwzNDUwLjktNDQzNywxOTg0LTMwMjUuNmMtMzgyLjEsMzY3LjctNjUzLjMsNzM3LjYtODg3LjUsMTIxNC4yQzEyMC41LDE2MSw3NjkuOCwyNTMxLjksMjYxNi44LDM3NTIuM0MzNDM0LjUsNDI5Mi42LDQ0NTMuNSw0NTQzLjIsNTQzMy41LDQ0NDQuNnoiLz48cGF0aCBkPSJNMzQyMC4xLDEwOTcuOGMtODAuMS04MC4xLTgwLjEtMzk2LjUsMC00NzYuN2MzNy0zNyw4OC4zLTM5LDE1NzkuOS0zOWMxNDkxLjYsMCwxNTQyLjksMi4xLDE1NzkuOSwzOWM4MC4xLDgwLjEsODAuMSwzOTYuNSwwLDQ3Ni43Yy0zNywzNy05NC41LDM5LTE1NzkuOSwzOUMzNTE0LjYsMTEzNi45LDM0NTcuMSwxMTM0LjgsMzQyMC4xLDEwOTcuOHoiLz48cGF0aCBkPSJNMzQzNC41LTQyNi42Yy0xMDIuNy01OS42LTEwMC43LTQ1Ni4xLDQuMS01MTEuNmMyNC43LTEyLjMsNTc3LjMtMjAuNSwxNTY5LjctMjAuNWMxNDgzLjMsMCwxNTM0LjcsMi4xLDE1NzEuNywzOWM4MC4xLDgwLjEsODAuMSwzOTYuNSwwLDQ3Ni43Yy0zNywzNy05NC41LDM5LTE1NzMuOCwzOUM0MDIyLjEtNDA0LDM0NTcuMS00MTIuMiwzNDM0LjUtNDI2LjZ6Ii8+PC9nPjwvZz4NCjwvc3ZnPg==',
          action: () => {
            console.log(this.save())
          }
        }
      ]
    }

    this.dom = {}
    this.dom.root = node
    this.dom.root.style.overflow = 'hidden'
    this.dom.root.style.userSelect = 'none'

    this.initSvg()

    // 鼠标事件
    this.dom.root.addEventListener('contextmenu', () => {
      event.preventDefault()
    })

    this.dom.root.addEventListener('mousedown', () => {
      this.hideDropdownWidget()
      this.hideWidget()
    })

    this.dom.dropdown.addEventListener('mousedown', () => {
      event.stopPropagation()
    })

    this.dom.dropdown.addEventListener('mouseup', () => {
      event.stopPropagation()
    })

    this.dom.widget.addEventListener('mousedown', () => {
      event.stopPropagation()
    })

    this.dom.widget.addEventListener('mouseup', () => {
      event.stopPropagation()
    })

    this.bindCanvasEvent()
  }

  initSvg() {
    // 添加子节点
    this.dom.svg = ShapeUtils.base.svg()
    this.dom.root.appendChild(this.dom.svg) // setOption时设置宽高

    // 添加defs
    let defs = ShapeUtils.base.defs()
    defs.appendChild(ShapeUtils.base.filter({
      id: 'ycBlockReplacementGlowFilter',
      width: '180%',
      height: '160%',
      x: '-30%',
      y: '-40%',
      $children: [{
          tag: 'feGaussianBlur',
          option: { in: 'SourceGraphic',
            stdDeviation: '2'
          }
        },
        {
          tag: 'feComponentTransfer',
          option: {
            result: 'outBlur',
            $children: [{
              tag: 'feFuncA',
              option: {
                type: 'table',
                tableValues: '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
              }
            }]
          }
        },
        {
          tag: 'feFlood',
          option: {
            'flood-color': '#FFFFFF',
            'flood-opacity': '1',
            result: 'outColor'
          }
        },
        {
          tag: 'feComposite',
          option: { in: 'outColor',
            in2: 'outBlur',
            operator: 'in',
            result: 'outGlow'
          }
        },
        {
          tag: 'feComposite',
          option: { in: 'SourceGraphic',
            in2: 'outGlow',
            operator: 'over'
          }
        }
      ]
    }))

    defs.appendChild(ShapeUtils.base.filter({
      id: 'ycBlockStackGlowFilter',
      width: '180%',
      height: '160%',
      x: '-30%',
      y: '-40%',
      $children: [{
          tag: 'feGaussianBlur',
          option: { in: 'SourceGraphic',
            stdDeviation: '4'
          }
        },
        {
          tag: 'feComponentTransfer',
          option: {
            result: 'outBlur',
            $children: [{
              tag: 'feFuncA',
              option: {
                type: 'table',
                tableValues: '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
              }
            }]
          }
        },
        {
          tag: 'feFlood',
          option: {
            'flood-color': '#FFF200',
            'flood-opacity': '1',
            result: 'outColor'
          }
        },
        {
          tag: 'feComposite',
          option: { in: 'outColor',
            in2: 'outBlur',
            operator: 'in',
            result: 'outGlow'
          }
        },
        {
          tag: 'feComposite',
          options: { in: 'SourceGraphic',
            in2: 'outGlow',
            operator: 'over'
          }
        }
      ]
    }))
    this.dom.svg.appendChild(defs)

    this.dom.ws = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockWorkspace'
    })
    this.dom.ws.appendChild(ShapeUtils.base.elementNS('rect', {
      height: '100%',
      width: '100%',
      class: 'ycBlockMainBackground',
      style: `fill: ${this.option.backgroundColor};`
    }))
    this.dom.info = ShapeUtils.base.elementNS('text', {
      id: 'ycBlockInfo',
      class: 'ycBlockText',
      y: '2',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      dy: '0',
      x: '8',
      transform: 'translate(128, 24)',
      $text: 'X: 0  Y: 0'
    })
    this.dom.ws.appendChild(this.dom.info)
    this.dom.canvas = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockCanvas'
    })
    this.dom.ws.appendChild(this.dom.canvas)

    this.dom.bubblecanvas = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockBubbleCanvas'
    })
    this.dom.ws.appendChild(this.dom.bubblecanvas)

    this.dom.svg.appendChild(this.dom.ws)

    this.dom.buttons = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockButtons',
      transform: 'translate(20,20)'
    })
    this.dom.svg.appendChild(this.dom.buttons)

    // dragsurface
    this.dom.dragsurface = ShapeUtils.base.svg({
      class: 'ycBlockDragSurface',
      style: 'display: block;'
    })
    this.dom.root.appendChild(this.dom.dragsurface)

    let dragdefs = ShapeUtils.base.defs()
    defs.appendChild(ShapeUtils.base.filter({
      id: 'ycBlockDragShadowFilter',
      width: '140%',
      height: '140%',
      x: '-20%',
      y: '-20%',
      $children: [{
          tag: 'feGaussianBlur',
          option: { in: 'SourceGraphic',
            stdDeviation: '6'
          }
        },
        {
          tag: 'feComponentTransfer',
          option: {
            result: 'offsetBlur',
            $children: [{
              tag: 'feFuncA',
              option: {
                type: 'linear',
                slope: '0.6'
              }
            }]
          }
        },
        {
          tag: 'feComposite',
          option: { in: 'SourceGraphic',
            in2: 'offsetBlur',
            operator: 'over'
          }
        }
      ]
    }))
    this.dom.dragsurface.appendChild(dragdefs)

    this.dom.dragcanvas = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockDragCanvas',
      filter: 'url(#ycBlockDragShadowFilter)'
    })
    this.dom.dragsurface.appendChild(this.dom.dragcanvas)
    this.dom.canvasList = [this.dom.canvas, this.dom.bubblecanvas, this.dom.dragcanvas]
    this.setCanvasTransfrom(this.dom.canvasList, 'scale(' + this.currentZoomFactor + ')')

    // flyout
    this.dom.flyout = ShapeUtils.base.svg({
      class: 'ycBlockFlyout',
      width: this.option.flyout.width
    })
    this.dom.root.appendChild(this.dom.flyout)
    let flyoutdefs = ShapeUtils.base.defs()

    let clipPath = ShapeUtils.base.elementNS('clipPath', {
      id: 'ycBlockMenuClipPath'
    })
    this.dom.flyoutclip = ShapeUtils.base.elementNS('rect', {
      id: 'ycBlockMenuClipRect',
      width: '0',
      height: '0',
      x: '0',
      y: '0'
    })
    clipPath.appendChild(this.dom.flyoutclip)
    flyoutdefs.appendChild(clipPath)

    this.dom.flyout.appendChild(flyoutdefs)
    this.dom.flyoutbg = ShapeUtils.base.elementNS('path', {
      class: 'ycBlockFlyoutBackground',
      d: `M 0,0 h ${this.option.flyout.width} a 0 0 0 0 1 0 0 v ${this.option.height} a 0 0 0 0 1 0 0 h ${-this.option.flyout.width} z`
    })
    this.dom.flyout.appendChild(this.dom.flyoutbg)

    let flyoutws = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockWorkspace',
      'clip-path': 'url(#ycBlockMenuClipPath)'
    })
    this.dom.flyout.appendChild(flyoutws)

    this.dom.flyoutcanvas = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockCanvas'
    })
    this.dom.flyoutcanvas.appendChild(ShapeUtils.base.elementNS('rect', {
      'fill-opacity': '0',
      x: '12',
      y: '1960',
      height: '56',
      width: '96'
    }))
    flyoutws.appendChild(this.dom.flyoutcanvas)

    this.dom.flyoutbubblecanvas = ShapeUtils.base.elementNS('g', {
      class: 'ycBlockBubbleCanvas'
    })
    flyoutws.appendChild(this.dom.flyoutbubblecanvas)
    this.dom.flyoutcanvasList = [this.dom.flyoutcanvas, this.dom.flyoutbubblecanvas]
    this.setCanvasTransfrom(this.dom.flyoutcanvasList, 'scale(' + this.flyoutZoomFactor + ')')

    // Widget
    var widgetfragment = document.createDocumentFragment()
    let toolbox = ShapeUtils.base.element('div', {
      class: 'ycBlockToolbox',
      style: 'direction: ltr;',
      height: `${this.option.height}`
    })
    widgetfragment.appendChild(toolbox)

    this.dom.menu = ShapeUtils.base.element('div', {
      class: 'ycBlockCategoryMenu'
    })
    toolbox.appendChild(this.dom.menu)

    this.dom.widget = ShapeUtils.base.element('div', {
      class: 'ycBlockWidgetDiv'
    })
    widgetfragment.appendChild(this.dom.widget)

    this.dom.tooltip = ShapeUtils.base.element('div', {
      class: 'ycBlockTooltipDiv'
    })
    widgetfragment.appendChild(this.dom.tooltip)

    this.dom.dropdown = ShapeUtils.base.element('div', {
      class: 'ycBlockDropDownDiv'
    })

    this.dom.dropdowncontent = ShapeUtils.base.element('div', {
      class: 'ycBlockDropDownContent'
    })
    this.dom.dropdown.appendChild(this.dom.dropdowncontent)

    this.dom.dropdownarrow = ShapeUtils.base.element('div', {
      class: 'ycBlockDropDownArrow'
    })
    this.dom.dropdown.appendChild(this.dom.dropdownarrow)
    widgetfragment.appendChild(this.dom.dropdown)

    this.dom.root.appendChild(widgetfragment)

    this.marker = null // 辅助插入标志占位
  }

  /**
   * 缩放画布
   */
  zoomCanvas(zoom) {
    if (!zoom) {
      logger.warn('Panel zoomCanvas failed: zoom is null')
      return
    }

    if (zoom < ycMinZoom || zoom > ycMaxZoom) {
      return
    }

    this.currentZoomFactor = zoom
    let m = this.dom.canvas.getCTM()
    let trans = 'translate(' + (Number(m.e)) + ',' + (Number(m.f)) + ') ' + 'scale(' + this.currentZoomFactor + ')'
    this.setCanvasTransfrom(this.dom.canvasList, trans)
  }

  /**
   * 重置画布
   */
  resetCanvas() {
    this.currentZoomFactor = 1.0
    this.setCanvasTransfrom(this.dom.canvasList, 'translate(0,0) scale(1.0)')
  }

  /**
   * 绑定事件
   */
  bindCanvasEvent() {
    let panel = this
    this.dom.svg.addEventListener('mousedown', () => {
      if (event.button === 0) {
        this.lastPoint.x = event.pageX
        this.lastPoint.y = event.pageY
        this.startDrag = true
        this.dom.flyout.style.pointerEvents = 'none'
      }
    })
    this.dom.svg.addEventListener('mousemove', function () {
      let stm = this.getScreenCTM()
      // 获取SVG的位置
      let X = $(this).offset().left
      let Y = $(this).offset().top
      // 获取canvas的偏移（由鼠标拖动引起的）
      let cm = panel.dom.canvas.getCTM()
      // 显示坐标为画布坐标（不是屏幕坐标）
      panel.updateInfo({
        x: Math.round((event.pageX - X - Number(cm.e)) / Number(cm.a)),
        y: Math.round((event.pageY - Y - Number(cm.f)) / Number(cm.d))
      })

      // 鼠标移动偏移量
      let deltaX = event.pageX - panel.lastPoint.x
      let deltaY = event.pageY - panel.lastPoint.y

      // 如果没有点击Block
      if (!panel.selected && panel.startDrag) {
        panel.lastPoint.x = event.pageX
        panel.lastPoint.y = event.pageY
        let m = panel.dom.canvas.getCTM()
        let trans = 'translate(' + (Number(m.e) + deltaX) + ',' + (Number(m.f) + deltaY) + ') ' + 'scale(' + panel.currentZoomFactor + ')'
        panel.setCanvasTransfrom(panel.dom.canvasList, trans)
      } else if (panel.selected) {
        let selectUid = panel.selected.getAttribute('data-uid')
        let selectInst = panel.instances[selectUid]

        // 如果Block被选中（点击）并且没有拖动
        if (panel.selected.classList.contains('ycBlockSelected') && !panel.selected.classList.contains('ycBlockDragging')) {
          // 插入占位
          panel.marker.ghost(selectInst)
          let markerElem = panel.marker.element()
          markerElem.setAttributeNS(null, 'visibility', 'hidden')
          // 如果是Stack类型
          if (selectInst.__proto.isStackBlock()) {
            // 复制childType
            panel.marker.childType(selectInst.childType())
            panel.selected.parentNode.insertBefore(markerElem, panel.selected)
          } else if (selectInst.__proto.isEmbedBlock()) {
            panel.marker.childType('')
            panel.dom.canvas.appendChild(markerElem)
          } else {
            logger.warn('mouse move: unknown block type')
          }

          // 如果有父节点, 给selected添加变换
          let prevBlock = selectInst.prevBlock()
          if (prevBlock) {
            let canvasOffset = panel.viewPortOffset()
            let _m = panel.selected.getCTM()
            let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a)
            let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d)
            panel.selected.setAttributeNS(null, 'transform', `translate(${_x},${_y})`)

            // 如果是嵌入类型，需要将当前位置更新给marker
            if (selectInst.__proto.isEmbedBlock()) {
              markerElem.setAttributeNS(null, 'transform', `translate(${_x},${_y})`)
              // 需要恢复父对象
              const sections = prevBlock.state.data.sections
              for (let sec of sections) {
                if (sec.__assign === selectInst) {
                  sec.__assign = null
                  break
                }
              }
            }
          }

          panel.dom.dragsurface.style.display = 'block'
          panel.dom.dragcanvas.appendChild(panel.selected)
          selectInst.childType('')
          panel.selected.classList.add('ycBlockDragging')

          // 如果选中的Block有父节点，需要向上通知所有父节点更新
          if (prevBlock) {
            prevBlock.update(null, {
              force: true,
              prev: true
            })
          }
        }
        // 根据鼠标位置调整surface
        panel.dom.dragsurface.setAttributeNS(null, 'style', 'display: block; transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')

        // 判断selected与其他Block的相交距离，选取距离最小的Block
        // 如果位于Block上方，则插入Marker，将Block设为Marker子节点
        // 如果位于Block下方，则将Block中插入一个Marker

        // 计算当前Selected的包围盒
        let sbbox = panel.selected.getBBox()
        let sm = panel.selected.getCTM()
        let canvasx = (deltaX + panel.grapPoint.x) / Number(sm.a)
        let canvasy = (deltaY + panel.grapPoint.y) / Number(sm.d)

        // 计算头部投放区域(取包围盒前半部分)
        const dropBoundbox = function (x, y, bbox) {
          return {
            left: x + bbox.x,
            top: y + bbox.y,
            right: x + bbox.x + bbox.width / 2,
            bottom: y + bbox.y + bbox.height
          }
        }
        let selectBox = dropBoundbox(canvasx, canvasy, sbbox)

        // 遍历实例列表
        let validHostList = []
        for (let inst of Object.values(panel.instances)) {
          if (inst.__proto.id === 'insertmarker') {
            continue
          }
          // 排除内部Block
          if (inst.__proto.isInternal()) {
            continue
          }

          // 排除选中序列中其他Block
          if (selectInst.hasInclude(inst)) {
            continue
          }

          // 类型兼容
          if (selectInst.__proto.isStackBlock() && !inst.__proto.canStack()) {
            continue
          }

          // 类型兼容
          if (selectInst.__proto.isEmbedBlock() && !inst.__proto.canEmbed()) {
            continue
          }

          // 获取可投放区域
          let regions = inst.getRegions()

          // 检查符合的唯一投放区域
          let validRegion = {}
          if (selectInst.__proto.isEmbedBlock() && regions.arguments) { // 仅判断参数位置
            validRegion.index = -1
            for (let [index, argu] of Object.entries(regions.arguments)) {
              // 检查形状是否匹配
              if (selectInst.__proto.def.shape !== argu.shape) {
                continue
              }

              // 检查数据类型是否匹配
              if (selectInst.stateData().datatype !== argu.datatype) {
                continue
              }

              // 取x坐标最小的
              if (Utils.isIntersects(selectBox, argu.rect)) {
                if (validRegion.index < 0 || argu.rect.left < validRegion.rect.left) {
                  validRegion.index = index
                  validRegion.rect = argu.rect
                }
              }
            }

            if (validRegion.index >= 0) {
              validHostList.push({
                instance: inst,
                region: validRegion // 投放位置
              })
            }
          } else if (selectInst.__proto.isStackBlock() && regions.stacks) { // 仅判断stack位置
            validRegion.position = ''

            // 获取序列可投放区域
            let stackpos = selectInst.stackPosition(true)
            for (let [pos, cbox] of Object.entries(regions.stacks)) {
              if (stackpos.indexOf(pos) < 0) {
                continue
              }

              // 如果Stack有Prev节点，则top区域无效
              if (pos === 'top' && inst.prevBlock()) {
                continue
              }

              // 如果Stack有Next节点，检查Next节点是否能够连接到Select序列的尾部
              if (pos === 'bottom') {
                const next = inst.nextBlock()
                if (next && next.protoId() !== 'insertmarker') {
                  let canstack = selectInst.lastBlock().__proto.canStackPosition()
                  if (canstack.indexOf('bottom') < 0) {
                    continue
                  }
                }
              }

              // 取y坐标最小的
              if (Utils.isIntersects(selectBox, cbox)) {
                if (validRegion.position === '' || cbox.top < validRegion.rect.top) {
                  validRegion.position = pos
                  validRegion.rect = cbox
                }
              }
            }

            if (validRegion.position !== '') {
              validHostList.push({
                instance: inst,
                region: validRegion // 投放位置
              })
            }
          }
        }

        // 从候选列表中提取最很合适的节点，
        // 优先取  x | y 坐标 最小的
        let hostInst = null
        if (validHostList.length > 0) {
          if (selectInst.__proto.isEmbedBlock()) {
            for (let h of validHostList) { // 检查
              if (!hostInst) {
                hostInst = h
              } else {
                if (h.region.rect.left < hostInst.region.rect.left) {
                  hostInst = h
                }
              }
            }
          } else if (selectInst.__proto.isStackBlock()) {
            for (let h of validHostList.reverse()) { // 倒序检查
              if (!hostInst) {
                hostInst = h
              } else {
                if (h.region.rect.top < hostInst.region.rect.top) {
                  hostInst = h
                }
              }
            }
          }
        }

        if (hostInst) {
          if (selectInst.__proto.isEmbedBlock()) {
            hostInst.insert = Number(hostInst.region.index)
          } else if (selectInst.__proto.isStackBlock()) {
            hostInst.insert = hostInst.region.position
          }
        }

        // 调整marker状态
        let markerElem = panel.marker.element()
        let oldhostInst = panel.marker.hostInstance

        if (selectInst.__proto.isEmbedBlock()) { // 参数变换
          markerElem.setAttributeNS(null, 'visibility', 'hidden')

          if (!oldhostInst) { // 在canvas上
            if (!hostInst) { // 没有新host, 仅更新位置
              markerElem.setAttributeNS(null, 'transform', `translate(${canvasx},${canvasy})`)
            } else { // 有新host, 给参数加特效
              let sec = hostInst.instance.state.data.sections[hostInst.insert]
              let argu = Argument.argument(sec)
              argu.highlight()
            }
          } else { // 如果在oldhost上
            if (!hostInst) { // 如果没有新host
              let oldsec = oldhostInst.instance.state.data.sections[oldhostInst.insert]
              let oldargu = Argument.argument(oldsec)
              oldargu.highlight(false)
              // 更新transform
              markerElem.setAttributeNS(null, 'transform', `translate(${canvasx},${canvasy})`)
            } else { // 从oldhost移动到newhost上
              if (oldhostInst.instance !== hostInst.instance || oldhostInst.insert !== hostInst.insert) {
                let oldsec = oldhostInst.instance.state.data.sections[oldhostInst.insert]
                let oldargu = Argument.argument(oldsec)
                oldargu.highlight(false)

                let sec = hostInst.instance.state.data.sections[hostInst.insert]
                let argu = Argument.argument(sec)
                argu.highlight()
              }
            }
          }
        } else if (selectInst.__proto.isStackBlock()) { // Stack
          if (!oldhostInst) { // 在canvas上
            if (!hostInst) { // 没有新host, 仅更新位置
              markerElem.setAttributeNS(null, 'visibility', 'hidden')
              markerElem.setAttributeNS(null, 'transform', `translate(${canvasx},${canvasy})`)
            } else { // 有新host, 将Marker添加到host中
              if (hostInst.insert === 'bottom') {
                hostInst.instance.next(panel.marker)
                // 更新
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              } else if (hostInst.insert === 'top') {
                // 从上方插入
                let hostPrevBlock = hostInst.instance.prevBlock()
                if (hostPrevBlock) {
                  hostPrevBlock.next(panel.marker)
                  hostPrevBlock.update(null, {
                    force: true,
                    prev: true
                  })
                } else {
                  let canvasOffset = panel.viewPortOffset()
                  // 更新位置
                  let _m = hostInst.instance.element().getCTM()
                  let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a) - panel.marker.ghostOffset.x
                  let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d) - panel.marker.ghostOffset.y
                  markerElem.setAttributeNS(null, 'transform', `translate(${_x},${_y})`)
                  panel.marker.childType('')
                  panel.marker.next(hostInst.instance)
                  panel.dom.canvas.appendChild(markerElem)
                }
              } else if (hostInst.insert === 'resolve') {
                hostInst.instance.resolve(panel.marker)
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              } else if (hostInst.insert === 'reject') {
                hostInst.instance.reject(panel.marker)
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
              panel.marker.update()
              markerElem.setAttributeNS(null, 'visibility', 'visible')
            }
          } else { // 如果在oldhost上
            if (!hostInst) { // 如果没有新host, 从oldhost删除，添加到canvas中
              markerElem.setAttributeNS(null, 'visibility', 'hidden')
              panel.marker.pop()
              panel.marker.childType('')
              panel.dom.canvas.appendChild(markerElem)
              // 更新transform
              markerElem.setAttributeNS(null, 'transform', `translate(${canvasx},${canvasy})`)
              // 更新
              if (oldhostInst.insert !== 'bottom') {
                let oldhostPrevBlock = oldhostInst.instance.prevBlock()
                if (oldhostPrevBlock) {
                  oldhostPrevBlock.update(null, {
                    force: true,
                    prev: true
                  })
                }
                oldhostInst.instance.update()
              } else {
                oldhostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            } else { // 从oldhost移动到newhost上
              if (oldhostInst.instance !== hostInst.instance || oldhostInst.insert !== hostInst.insert) {
                // 取出Marker
                panel.marker.pop()
                if (oldhostInst.insert === 'top') {
                  let oldhostPrevBlock = oldhostInst.instance.prevBlock()
                  if (oldhostPrevBlock) {
                    oldhostPrevBlock.update(null, {
                      force: true,
                      prev: true
                    })
                  }
                }

                if (oldhostInst.instance !== hostInst.instance ||
                  (oldhostInst.insert === 'resolve' || oldhostInst.insert === 'reject')) {
                  oldhostInst.instance.update(null, {
                    force: true,
                    prev: true
                  })
                }

                if (hostInst.insert === 'bottom') {
                  hostInst.instance.next(panel.marker)
                } else if (hostInst.insert === 'top') {
                  // 从上方插入
                  let hostPrevBlock = hostInst.instance.prevBlock()
                  if (hostPrevBlock) {
                    hostPrevBlock.next(panel.marker)
                    hostPrevBlock.update(null, {
                      force: true,
                      prev: true
                    })
                  } else {
                    let canvasOffset = panel.viewPortOffset()
                    // 更新位置
                    let _m = hostInst.instance.element().getCTM()
                    let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a) - panel.marker.ghostOffset.x
                    let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d) - panel.marker.ghostOffset.y
                    panel.marker.childType('')
                    markerElem.setAttributeNS(null, 'transform', `translate(${_x},${_y})`)
                    panel.marker.next(hostInst.instance)
                    panel.dom.canvas.appendChild(markerElem)
                  }
                } else if (hostInst.insert === 'resolve') {
                  hostInst.instance.resolve(panel.marker)
                } else if (hostInst.insert === 'reject') {
                  hostInst.instance.reject(panel.marker)
                }
                // 更新
                panel.marker.update()
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            }
          }
        }
        panel.marker.hostInstance = hostInst
      }
    })

    let __mouseleaveorup = () => {
      panel.startDrag = false
      panel.dom.flyout.style.pointerEvents = 'auto'

      if (panel.selected) {
        let uid = panel.selected.getAttribute('data-uid')
        if (panel.selected.classList.contains('ycBlockSelected') && panel.selected.classList.contains('ycBlockDragging')) {
          // 插入占位
          var markerElem = panel.marker.element()
          // 判断是否在Flyout区域
          if (panel.isInFlyoutRegion(event.pageX, event.pageY)) {
            // 删除Block实例
            panel.removeBlock(uid)
          } else {
            let selectInst = panel.instances[uid]

            // 如果是Stack类型
            if (selectInst.__proto.isStackBlock()) {
              // 拷贝childtype
              let childType = panel.marker.childType()
              selectInst.childType(childType)
              const oldLayoutHeight = selectInst.layoutHeight()
              const oldSeqHeight = selectInst.sequenceHeight()

              let prev = panel.marker.prevBlock()
              let next = panel.marker.nextBlock()

              if (!prev) {
                // 如果有next,将next添加到selected上
                if (next) {
                  selectInst.last(next)
                }
                //panel.selected.insertBefore(markerElem)
                markerElem.parentNode.insertBefore(panel.selected, markerElem)
              } else {
                panel.marker.pop()
                if (childType === 'resolve') {
                  prev.resolve(selectInst)
                } else if (childType === 'reject') {
                  prev.reject(selectInst)
                } else {
                  prev.next(selectInst)
                }
              }

              // 更新变换，只需拷贝marker的transform
              let m = markerElem.getAttribute('transform').replace(/[^0-9\-.,]/g, '').split(',')

              if (next) {
                selectInst.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1]) + oldLayoutHeight - oldSeqHeight
                  }
                })
              } else {
                selectInst.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1])
                  }
                })
              }
            } else if (selectInst.__proto.isEmbedBlock()) { // 如果是嵌入类型
              let hostInst = panel.marker.hostInstance

              // 获取参数对象
              if (!hostInst) {
                selectInst.childType('')
                //panel.selected.insertBefore(markerElem)
                markerElem.parentNode.insertBefore(panel.selected, markerElem)
                // 更新变换，只需拷贝marker的transform
                let m = markerElem.getAttribute('transform').replace(/[^0-9\-.,]/g, '').split(',')

                panel.selected.__instance.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1])
                  }
                })
              } else {
                let sec = hostInst.instance.state.data.sections[hostInst.insert]
                let argu = Argument.argument(sec)
                argu.highlight(false)
                selectInst.childType('argument')
                hostInst.instance.element().appendChild(panel.selected)
                sec.__assign = selectInst
                // 通知父节点更新布局
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            }
            panel.selected.classList.remove('ycBlockDragging', 'ycBlockSelected')

            // 更新
            selectInst.update(null, {
              force: true,
              prev: true,
              next: true
            })
          }
          panel.marker.ghost(null)
          panel.dom.dragsurface.style.display = 'none'
          panel.dom.dragsurface.setAttributeNS(null, 'style', 'transform: translate3d(0px,0px,0px)')
        }
        panel.selected = null
      }
    }

    this.dom.svg.addEventListener('mouseup', __mouseleaveorup)
    this.dom.svg.addEventListener('mouseleave', __mouseleaveorup)

    this.dom.flyout.addEventListener('mousedown', () => {
      if (event.button === 0) {
        this.flyoutlastPoint.x = event.pageX
        this.flyoutlastPoint.y = event.pageY
        this.flyoutstartDrag = true
      }
    })

    this.dom.flyout.addEventListener('mousemove', function () {
      let deltaY = event.pageY - panel.flyoutlastPoint.y
      if (!panel.flyoutselected && panel.flyoutstartDrag) { // 上下滚动拖放
        panel.flyoutlastPoint.x = event.pageX
        panel.flyoutlastPoint.y = event.pageY
        let m = panel.dom.flyoutcanvas.getCTM()

        let y = Number(m.f) + deltaY
        if (y > 0) {
          y = 0
        }
        let height = Number(this.getAttribute('height'))
        let maxY = (height - panel.flyoutHeight) * panel.flyoutZoomFactor

        if (y < maxY) {
          y = maxY
        }

        let trans = 'translate(0,' + y + ') ' + 'scale(' + panel.flyoutZoomFactor + ')'
        panel.setCanvasTransfrom(panel.dom.flyoutcanvasList, trans)
      } else if (panel.flyoutselected) { // 拖动Block
        // 获取选中的类型
        let bid = panel.flyoutselected.getAttribute('data-id')
        let proto = panel.registries[bid]

        // 根据当前鼠标位置计算在SVG中位置
        let svgOffset = $(panel.dom.svg).offset()
        let X = svgOffset.left
        let Y = svgOffset.top
        let cm = panel.dom.canvas.getCTM()

        // 根据Block尺寸调整位置
        let bbox = panel.flyoutselected.getBBox()

        // 根据鼠标位置计算得到在Canvas中的位置，然后根据Block的包围盒计算中心锚点偏移
        // 这样就能将Block的中心放在当前鼠标的位置
        panel.grapPoint.x = (event.pageX - X - Number(cm.e)) / Number(cm.a) - (bbox.width / 2 + bbox.x)
        panel.grapPoint.y = (event.pageY - Y - Number(cm.f)) / Number(cm.a) - (bbox.height / 2 + bbox.y)

        let newInst = panel.addBlock({
          type: proto.def.id,
          state: {
            transform: {
              x: panel.grapPoint.x,
              y: panel.grapPoint.y
            }
          }
        }, panel.dom.dragcanvas)

        // 将坐标转回屏幕位置
        panel.grapPoint.x *= Number(cm.a)
        panel.grapPoint.y *= Number(cm.d)

        panel.selected = newInst.element()
        panel.selected.classList.add('ycBlockSelected', 'ycBlockDragging')

        // 插入占位(在末尾添加)
        panel.marker.ghost(newInst)
        var markerElem = panel.marker.element()
        markerElem.setAttributeNS(null, 'visibility', 'hidden')
        panel.dom.canvas.appendChild(markerElem)

        panel.flyoutselected = null
        panel.lastPoint.x = event.pageX
        panel.lastPoint.y = event.pageY
        let deltaX = event.pageX - panel.lastPoint.x
        let deltaY = event.pageY - panel.lastPoint.y
        // 根据鼠标位置调整surface
        panel.dom.dragsurface.setAttributeNS(null, 'style', 'transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')
        panel.dom.dragsurface.style.display = 'block'

        panel.startDrag = true
        this.style.pointerEvents = 'none'
      }
    })

    this.dom.flyout.addEventListener('mouseup', () => {
      this.flyoutstartDrag = false
      this.flyoutselected = null
    })

    this.dom.flyout.addEventListener('mouseleave', () => {
      this.flyoutstartDrag = false
      this.flyoutselected = null
    })
  }

  /**
   * 获取Viewport偏移量(Canvas坐标)
   */
  viewPortOffset() {
    let m = this.dom.canvas.getCTM()
    return {
      x: Number(m.e),
      y: Number(m.f)
    }
  }

  /**
   * 获取编辑面板的视口(SVG坐标)
   */
  viewPortBoundbox() {
    let m = this.dom.canvas.getCTM()
    return {
      left: Number(m.e) * Number(m.a),
      top: Number(m.f) * Number(m.d),
      right: (Number(m.e) + Number(this.dom.svg.getAttribute('width'))) * Number(m.a),
      bottom: (Number(m.f) + Number(this.dom.svg.getAttribute('height'))) * Number(m.d)
    }
  }

  /**
   * 判断坐标点是否在Flyout区域
   */
  isInFlyoutRegion(x, y) {
    let bbox = this.dom.flyoutbg.getBBox()
    let ctm = this.dom.flyoutbg.getScreenCTM()

    let left = ctm.e + bbox.x
    let right = left + bbox.width
    let top = ctm.f + bbox.y
    let bottom = top + bbox.height
    return x >= left && x <= right && y >= top && y <= bottom
  }

  /**
   * 显示坐标信息
   */
  updateInfo(info) {
    this.dom.info.textContent = `X: ${info.x} Y: ${info.y}`
  }

  /**
   * 统一设置canvas变换矩阵（平移，缩放）
   */
  setCanvasTransfrom(canvas, trans) {
    canvas.forEach(function (item) {
      item.setAttributeNS(null, 'transform', trans)
    })
  }

  /**
   * 处理包定义
   * package: Object block包定义
   */
  processPackage(pkg) {
    if (!this.option.blocks.defs) {
      this.option.blocks.defs = {
        variant: {
          name: '变量',
          members: []
        },
        marker: {
          name: '标记',
          members: []
        },
        action: {
          name: '动作',
          members: []
        },
        event: {
          name: '事件',
          members: []
        },
        express: {
          name: '表达式',
          members: []
        },
        control: {
          name: '控制',
          members: []
        }
      }
    }

    let defs = this.option.blocks.defs
    if (yuchg.isArray(pkg)) {
      for (const item of pkg) {
        let type = item.type
        if (defs[type]) {
          defs[type].members = defs[type].members.concat(item)
        }
      }
    } else if (yuchg.isObject(pkg)) {
      for (let [type, val] of Object.entries(pkg)) {
        if (yuchg.isArray(val)) {
          if (defs[type]) {
            defs[type].members = defs[type].members.concat(val)
          }
        }
      }
    }
  }

  setOption(option) {
    // 清空之前的定义
    this.option.blocks.defs = null
    // 合并Buttons
    let buttons = [].concat(this.option.buttons)
    if (option && yuchg.isArray(option.buttons)) {
      buttons = buttons.concat(option.buttons)
    }
    delete option['buttons']
    // 合并
    $.extend(true, this.option, option)
    this.option.buttons = buttons

    //
    let rect = this.dom.ws.querySelector('.ycBlockMainBackground')
    rect.style.fill = this.option.backgroundColor

    // 提取Block包定义
    for (let p of this.option.blocks.packages.values()) {
      this.processPackage(p)
    }

    let defs = this.option.blocks.defs
    //
    let cates = this.option.blocks.categories
    for (let val of Object.values(cates)) {
      val.blocks = []
    }

    // 注册Block
    for (let [type, val] of Object.entries(defs)) {
      for (let def of val.members.values()) {
        def.type = type
        this.registerBlock(def, cates)
      }
    }

    this.prepare()
  }

  prepare() {
    this.marker = this.createBlockInstance('insertmarker')
    // 初始化toolbox
    this.initCategoryToolbox()
    // 初始化按钮面板
    this.initButtons()
  }

  /**
   *
   */
  initButtons() {
    while (this.dom.buttons.firstChild) {
      this.dom.buttons.removeChild(this.dom.buttons.firstChild)
    }

    let fragment = document.createDocumentFragment()
    let offsety = 0
    for (let btn of this.option.buttons) {
      let img = ShapeUtils.base.image({
        width: 36,
        height: 36,
        y: offsety,
        url: btn.img
      })

      img.setAttributeNS(null, 'data-id', btn.id)
      let panel = this
      img.addEventListener('mousedown', function () {
        yuchg.isFunction(btn.action) && btn.action(panel)
      })

      fragment.appendChild(img)
      offsety += 44
    }
    this.dom.buttons.appendChild(fragment)
  }

  initCategoryToolbox() {
    const categories = this.option.blocks.categories
    const registries = this.registries
    let zoom = this.flyoutZoomFactor
    let panel = this

    function createMenu(key, offset) {
      let cate = categories[key]

      if (!cate) {
        logger.warn('category can not found: ' + key)
        return
      }
      let state = cate.state

      let menurow = ShapeUtils.base.element('div', {
        class: 'ycBlockCategoryMenuRow'
      })

      let menuitem = ShapeUtils.base.element('div', {
        class: 'ycBlockCategoryMenuItem',
        'data-id': key
      })

      let icon = ShapeUtils.base.element('div', {
        class: 'ycBlockCategoryItemBubble',
        'style': `background-color: ${state.background.fill}; border-color: ${state.background.stroke};`
      })
      menuitem.appendChild(icon)

      let label = ShapeUtils.base.element('div', {
        class: 'ycBlockCategoryMenuItemLabel',
        $text: cate.name
      })
      menuitem.appendChild(label)
      menurow.appendChild(menuitem)

      let trans = 'translate(0,' + (-offset * zoom) + ') scale(' + zoom + ')'
      menuitem.addEventListener('click', function () {
        d3.selectAll('.ycBlockFlyout>.ycBlockWorkspace>g')
          .transition()
          .duration(500)
          .attr('transform', trans)
      })

      return menurow
    }

    let padding = 12
    let offsety = padding
    let toolboxspace = 64

    for (let [key, val] of Object.entries(categories)) {
      if (!val.display || val.display !== 'none') {
        // 创建菜单
        let menuitem = createMenu(key, offsety - padding)
        categories[key].menuitem = menuitem
        this.dom.menu.appendChild(menuitem)

        // 创建Label
        let labellen = Utils.computeTextLength(val.name) + 16

        let label = ShapeUtils.group.flyoutLabel({
          text: val.name,
          width: labellen,
          height: 40,
          translatex: 20,
          translatey: offsety
        })
        categories[key].flyoutlable = label
        this.dom.flyoutcanvas.append(label)
        offsety += toolboxspace

        // 创建列表
        if (val.blocks) {
          val.blocks.forEach(function (block) {
            let proto = registries[block]
            if (proto && proto.prototypeElement) {
              // 仅克隆DOM（并非创建实例）
              let $elem = $(proto.prototypeElement).clone(true)
              let elem = $elem[0]
              elem.classList.add('ycBlockFlyout')
              panel.dom.flyoutcanvas.appendChild(elem)

              // 获取包围盒大小
              let bbox = elem.getBBox()
              offsety += (-bbox.y)
              elem.setAttributeNS(null, 'transform', `translate(36, ${offsety})`)

              offsety += (bbox.height + 16)

              // 添加事件
              elem.addEventListener('mousedown', function () {
                panel.flyoutselected = this
              })

              elem.addEventListener('mouseup', function () {
                if (!panel.startDrag) {
                  panel.flyoutselected = null
                }
              })
            } else {
              logger.warn('block registry is corrupted:' + block)
            }
          })
        }
      }
    }
    // 记录总高度
    this.flyoutHeight = offsety
  }

  createBlockInstance(type, state) {
    // 坚持类型是否注册
    if (!this.hasRegistered(type)) {
      logger.warn('block is unregistered: ' + type)
      return
    }

    // 创建Block实例
    let prototype = this.registries[type]
    // 放入队列中
    let inst = prototype.instance(state)
    this.instances[inst.uid] = inst
    return inst
  }

  removeBlock(uid) {
    if (!yuchg.isString(uid)) {
      logger.warn('removeBlock failed: wrond uid - ', uid)
      return
    }
    let inst = this.instances[uid]
    if (!inst) {
      logger.warn('removeBlock failed: can not found uid - ', uid)
      return
    }

    inst.clear()
    delete this.instances[uid]
  }

  showInputWidget(option) {
    if (!option) {
      this.hideWidget()
      return
    }

    let parent = this.dom.widget
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }

    let panel = this
    let dom = option.dom

    parent.classList.add('fieldTextInput')
    parent.setAttributeNS(null, 'style', `transition: box-shadow 0.25s ease 0s;box-shadow: rgba(255, 255, 255, 0.3) 0px 0px 0px 4px;`)
    // 根据option设置边框颜色
    parent.style.borderColor = option.background.stroke
    console.warn('input', option)
    // 设置缩放比例
    parent.style.transform = `scale(${panel.currentZoomFactor})`
    parent.style.top = option.y + 'px'
    parent.style.left = option.x + 'px'
    parent.style.width = option.width + 'px'
    parent.style.height = option.height + 'px'

    let input = ShapeUtils.base.element('input', {
      class: 'ycBlockHtmlInput',
      spellcheck: 'true',
      value: '',
      type: 'text'
    })

    input.value = option.value
    input.addEventListener('input', function () {
      let newValue = this.value
      if (option.type === 'number') {
        newValue = newValue.replace(/[^\d.]/g, '')
      }
      this.value = newValue
      // 动态刷新大小
      callback && callback(newValue)
      // 调整控件大小
      parent.style.width = dom.__section.data.size.width
    })

    let callback = option.callback
    input.addEventListener('blur', function () {
      let newValue = this.value
      callback && callback(newValue)
      panel.hideWidget(false)
    })
    parent.appendChild(input)
    parent.style.display = 'block'
    input.focus()
  }

  hideWidget(clear = true) {
    if (this.dom.widget) {
      this.dom.widget.setAttribute('class', 'ycBlockWidgetDiv')
      this.dom.widget.setAttribute('style', '')
      clear && $(this.dom.widget).children().remove()
    }
  }

  showDropdownWidget(option) {
    if (!option) {
      this.hideDropdownWidget()
      return
    }

    let parent = this.dom.dropdown
    let content = this.dom.dropdowncontent
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }

    let panel = this
    // 根据option设置边框颜色
    parent.setAttribute('style', 'transition: opacity 0.25s ease 0s;')
    parent.style.borderColor = option.background.stroke
    parent.style.backgroundColor = option.background.fill

    const createPopMenu = function (option) {
      let menu = ShapeUtils.base.element('div', {
        class: 'ycBlockDropDownMenu',
        role: 'menu',
        'aria-haspopup': 'true',
        tabindex: '0',
        style: 'user-select: none;'
      })

      // 添加菜单项
      option.values.forEach((item, i) => {
        let menuitem = ShapeUtils.base.element('div', {
          class: 'ycBlockDropDownMenuItem',
          role: 'menuitemcheckbox',
          style: 'user-select: none;',
          'data-index': `${i}`,
          'data-value': `${item.value}`
        })

        let menucontent = ShapeUtils.base.element('div', {
          class: 'ycBlockDropDownMenuItemContent',
          role: 'menuitemcheckbox',
          style: 'user-select: none;'
        })
        menucontent.appendChild(ShapeUtils.base.element('div', {
          class: 'ycBlockMenuItemCheckBox',
          style: 'user-select: none;'
        }))
        menucontent.appendChild(document.createTextNode(`${item.name}`))

        if (i === option.select) {
          menucontent.classList.add('ycBlockSelected')
        }
        let callback = option.callback

        menuitem.addEventListener('mouseover', function () {
          this.classList.add('ycBlockDropDownMenuItemHover')
        })
        menuitem.addEventListener('mouseout', function () {
          this.classList.remove('ycBlockDropDownMenuItemHover')
        })
        menuitem.addEventListener('mousedown', function () {
          event.stopPropagation()
          // 更新索引
          let i = this.getAttribute('data-index')
          let v = this.getAttribute('data-value')
          callback && callback(Number(i), Number(v))
          panel.hideDropdownWidget()
        })
        menuitem.appendChild(menucontent)
        menu.appendChild(menuitem)
      })
      return menu
    }

    let menu = createPopMenu(option)
    content.appendChild(menu)
    let arrow = panel.dom.dropdownarrow

    // 判断菜单是否被遮挡
    let menuWidth = $(parent).outerWidth() / 2
    let menuHeight = $(parent).outerHeight()
    let cbox = this.dom.ws.getBBox()

    // 根据屏幕位置，调整菜单
    if (option.bottom + menuHeight > cbox.height) { // 调整为顶部显示
      parent.style.transform = 'translate(0px, -20px)'
      parent.style.top = (option.top - menuHeight) + 'px'
      parent.style.left = (option.center - menuWidth) + 'px'
      arrow.classList.remove('ycBlockArrowTop')
      arrow.classList.add('ycBlockArrowBottom')
      arrow.setAttribute('style', `transform: translate(${menuWidth - 9}px, ${menuHeight - 9}px) rotate(45deg);`)
    } else {
      parent.style.transform = 'translate(0px, 20px)'
      parent.style.top = option.bottom + 'px'
      parent.style.left = (option.center - menuWidth) + 'px'
      arrow.classList.remove('ycBlockArrowBottom')
      arrow.classList.add('ycBlockArrowTop')
      arrow.setAttribute('style', `transform: translate(${menuWidth - 9}px, -9px) rotate(45deg);`)
    }

    parent.style.opacity = '1'
    parent.style.display = 'block'
  }

  hideDropdownWidget() {
    let parent = this.dom.dropdown
    parent.setAttribute('class', 'ycBlockDropDownDiv')
    parent.setAttribute('style', 'display: none; opacity: 0;')

    let content = this.dom.dropdowncontent
    while (content.firstChild) {
      content.removeChild(content.firstChild)
    }
  }

  addBlock(option, parent) {
    if (!option || !option.type) {
      return
    }

    let inst = this.createBlockInstance(option.type, option.state)
    if (!inst) {
      return
    }

    let panel = this
    let dom = panel.dom
    let svg = dom.svg
    let elem = inst.element()
    elem.setAttribute('data-uid', inst.uid)
    elem.addEventListener('mousedown', function () {
      event.stopPropagation()

      if (event.button === 0) {
        panel.hideWidget()

        panel.selected = this
        let m = this.getCTM()
        let pm = dom.canvas.getCTM()
        panel.grapPoint.x = (Number(m.e) - Number(pm.e))
        panel.grapPoint.y = (Number(m.f) - Number(pm.f))
        panel.selected.classList.add('ycBlockSelected')

        // 父类
        panel.lastPoint.x = event.pageX
        panel.lastPoint.y = event.pageY
        panel.startDrag = true
        dom.flyout.style.pointerEvents = 'none'
      } else if (event.button === 2) {
        let offset = svg.getScreenCTM()
        let X = offset.e
        let Y = offset.f
        let selectUid = this.getAttribute('data-uid')
        let selectInst = panel.instances[selectUid]

        // 弹出上下文菜单
        if (!selectInst.__proto.isInternal()) {
          // 生成菜单项
          let menuitems = [{
              id: 'copy',
              name: '复制',
              action: () => {
                panel.cloneBlock(selectUid, true)
              }
            },
            {
              id: 'copyself',
              name: '复制自己',
              action: () => {
                panel.cloneBlock(selectUid)
              }
            },
            {
              id: 'delete',
              name: '删除',
              action: () => {
                panel.removeBlock(selectUid)
              }
            }
          ]

          // 生成导出菜单项
          for (let item of selectInst.exportItems()) {
            const ext = item.ext
            const fmt = item.fmt
            if (item.menuItem === true) {
              menuitems.push({
                id: 'export@' + fmt,
                name: item.menuName ? item.menuName : ('导出' + fmt),
                action: () => {
                  let data = selectInst.export(fmt)
                  panel.option.exportCallback && panel.option.exportCallback(panel, ext, data)
                }
              })
            }
          }

          panel.showContextMenu({
            x: event.pageX - X,
            y: event.pageY - Y,
            items: menuitems
          })
        }
      }
      panel.hideDropdownWidget()
    })

    elem.addEventListener('mouseup', function () {
      if (event.button === 2) {
        event.stopPropagation()
      }
    })

    if (parent) {
      parent.appendChild(elem)
    } else {
      this.dom.canvas.appendChild(elem)
    }
    return inst
  }

  showContextMenu(option) {
    if (!option || !yuchg.isArray(option.items) || option.items.length === 0) {
      this.hideWidget()
      return
    }

    let parent = this.dom.widget
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }

    let panel = this
    parent.setAttribute('style', 'direction: ltr;')
    parent.style.top = option.y
    parent.style.left = option.x

    let menu = ShapeUtils.base.element('div', {
      class: 'ycBlockContextMenu',
      role: 'menu',
      'aria-haspopup': 'true',
      tabindex: '0',
      style: 'user-select: none;'
    })

    for (let item of option.items) {
      let itemElem = ShapeUtils.base.element('div', {
        class: 'ycBlockContextMenuItem',
        role: 'menuitem',
        id: `cm-${item.id}`,
        style: 'user-select: none;'
      })

      itemElem.appendChild(ShapeUtils.base.element('div', {
        class: 'ycBlockContextMenuItemContent',
        style: 'user-select: none;'
      }))
      itemElem.appendChild(document.createTextNode(item.name))

      itemElem.addEventListener('mouseover', function () {
        this.classList.add('ycBlockContextMenuItemHover')
      })

      itemElem.addEventListener('mouseout', function () {
        this.classList.remove('ycBlockContextMenuItemHover')
      })

      itemElem.addEventListener('mousedown', function () {
        event.stopPropagation()
        if (event.button === 0) {
          // 响应
          itemElem.action()
        }
        panel.hideWidget()
      })
      menu.appendChild(itemElem)
    }

    parent.appendChild(menu)
    parent.style.display = 'block'
  }

  addBlocks(blocks) {
    if (yuchg.isArray(blocks)) {
      // 创建多个Block
      blocks.forEach((elem) => {
        this.addBlock(elem)
      })
    } else if (yuchg.isObject(blocks)) {
      // 创建单个Block
      this.addBlock(blocks)
    }
  }

  /**
   * 根据UID
   * @param {*} uid
   */

  findBlock(uid) {
    return this.instances[uid]
  }

  /**
   * 注册Block
   */
  registerBlock(def, list) {
    let registries = this.registries
    // 提示重复
    if (registries[def.id]) {
      logger.warn(`${def.type} registered repeated:  ${def.id}`)
    }

    // 获取默认类目信息
    let cate = acquireCategoryContext(def.category)
    if (cate && cate.state) {
      if (!def.state) {
        def.state = {}
      }
      def.state = $.extend(true, def.state, cate.state)
    }

    registries[def.id] = Blocks.createPrototype(Object.assign({
      type: def.type,
      __panel: this,
      state: {}
    }, def))
    if (!registries[def.id]) {
      logger.warn(`${def.type} registered failed:  ${def.id}`)
    } else {
      list && list[def.category].blocks.push(def.id)
      logger.log(`${def.type} registered successed:  ${def.id}`)
    }
  }

  /**
   * 检查Block是否注册
   */
  hasRegistered(type) {
    if (this.registries.hasOwnProperty(type) && this.registries[type]) {
      return true
    }
    return false
  }

  /**
   * 克隆Block
   * seq = true 时，复制整个序列
   */

  cloneBlock(uid, seq = false) {
    let instance = this.instances[uid]
    if (!instance) {
      logger.warn(`Panel CloneBlock failed: can not find Instance [${uid}]`)
      return
    }

    const clone = instance.cloneSelf(seq)
    // 调整位置
    const oldPos = instance.canvasPosition()
    clone.setTranslate(oldPos.x + 64, oldPos.y + 64)
  }

  /**
   * 清空所有Blocks
   */
  clearBlocks() {
    const panel = this
    document.querySelectorAll('.ycBlockCanvas g.ycBlockDraggable').forEach(function (elem) {
      if (elem.getAttribute('data-id') === 'insertmarker') {
        return false
      }
      let uid = elem.getAttribute('data-uid')
      panel.removeBlock(uid)
    })

    for (let uid of Object.keys(panel.instances)) {
      logger.warn(`Panel ClearBlocks: Instance [${uid}] still existed`)
    }
  }

  /**
   * resize
   * @param {*} type
   */
  resize(option) {
    let w = this.option.width
    let h = this.option.height
    if (option) {
      option.width && (w = +option.width)
      option.height && (h = +option.height)
    } else {
      // 获取父节点尺寸
      let parent = this.dom.root.parentNode
      w = parent.clientWidth
      h = parent.clientHeight
    }
    // 调整尺寸
    this.dom.svg.setAttributeNS(null, 'width', w)
    this.dom.svg.setAttributeNS(null, 'height', h)
    this.dom.flyout.setAttributeNS(null, 'height', h)
    this.dom.flyoutbg.setAttributeNS(null, 'd', `M 0,0 h ${this.option.flyout.width} a 0 0 0 0 1 0 0 v ${h} a 0 0 0 0 1 0 0 h ${-this.option.flyout.width} z`)

    this.dom.flyoutclip.setAttributeNS(null, 'width', this.option.flyout.width)
    this.dom.flyoutclip.setAttributeNS(null, 'height', h)

    this.option.width = w
    this.option.height = h

  }

  /**
   * 脚步格式化导出
   * @param {*} type  json | js | html
   */

  export (type) {

  }

  /**
   * 保存为内部格式
   */
  save() {
    const panel = this
    let data = {
      author: 'Unique',
      blocks: []
    }
    
    panel.dom.canvas.querySelectorAll('g.ycBlockDraggable').forEach(function (elem) {
      if (elem.getAttribute('data-id') === 'insertmarker') {
        return true
      }
      let uid = elem.getAttribute('data-uid')
      let instance = panel.instances[uid]
      console.log(elem, uid, instance)
      data.blocks.push(instance.encode())
    })
    return JSON.stringify(data)
  }

  /**
   *
   * @param {*} data
   */
  createBlock(data) {
    let instance = this.addBlock({
      type: data.protoId,
      state: {
        transform: data.state.transform
      }
    })
    //
    instance.decode(data)
    return instance
  }

  /**
   * 从内部格式加载
   */
  load(data) {
    // 清空内容
    this.clearBlocks()

    if (!data) {
      return
    }

    if (yuchg.isString(data)) {
      let trimData = yuchg.trimString(data)

      if (trimData !== '') {
        let data = JSON.parse(trimData)
        if (!data) {
          logger.warn('Panel load failed: data corrupted -- ', trimData)
          return
        }

        if (!yuchg.isArray(data.blocks) || data.blocks.length === 0) {
          return
        }

        // 加载数据
        for (let block of data.blocks) {
          this.createBlock(block)
        }
      }
    }
  }
}

export default Panel
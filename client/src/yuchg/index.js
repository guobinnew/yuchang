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

import Panel from './panel'
import yuchg from './base'

yuchg.Scratch = {
  /**
   * 初始化编辑面板
   * dom: 用于绘制面板的DOM节点
   */
  init: function (dom, err) {
    if (!dom) {
      err && err('dom is invalid')
      return
    }
    return new Panel(dom)
  }
}

export default yuchg

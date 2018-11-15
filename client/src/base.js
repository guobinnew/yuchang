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

let yuchg = {}

yuchg.global = this // 大多情况为window

/**
 * 判断变量是否定义
 */
yuchg.isDef = function (val) {
  // void 0 始终等于 undefined
  return val !== void 0
}

/**
 * 判断变量类型是否是字符串
 */
yuchg.isString = function (val) {
  return typeof val === 'string'
}

/**
 * 判断变量类型是否是布尔值
 */
yuchg.isBoolean = function (val) {
  return typeof val === 'boolean'
}

/**
 * 判断变量类型是否是数值
 */
yuchg.isNumber = function (val) {
  return typeof val === 'number'
}

/**
 * 根据字符串名字获取对象
 */
yuchg.getObjectByName = function (name, optObj) {
  let parts = name.split('.')
  let cur = optObj || yuchg.global
  for (let i = 0; i < parts.length; i++) {
    cur = cur[parts[i]]
    if (!yuchg.isDefAndNotNull(cur)) {
      return null
    }
  }
  return cur
}

/**
 * 打印错误日志（内部使用）
 */
yuchg.logToConsole_ = function (msg) {
  if (yuchg.global.console) {
    yuchg.global.console['error'](msg)
  }
}

/**
 * 空函数
 */
yuchg.nullFunction = function () {}

/**
 * 抽象方法占位函数
 */
yuchg.abstractMethod = function () {
  throw new Error('unimplemented abstract method')
}

/**
 * 改进typeof
 */
yuchg.typeOf = function (value) {
  let s = typeof value
  if (s === 'object') {
    if (value) {
      if (value instanceof Array) {
        return 'array'
      } else if (value instanceof Object) {
        return s
      }

      let className = Object.prototype.toString.call( /** @type {!Object} */ (value))
      if (className === '[object Window]') {
        return 'object'
      }

      // 判断是否为数组类型
      if (className === '[object Array]' ||
        (typeof value.length === 'number' &&
          typeof value.splice !== 'undefined' &&
          typeof value.propertyIsEnumerable !== 'undefined' &&
          !value.propertyIsEnumerable('splice'))) {
        return 'array'
      }

      // 判断是否为函数类型
      if (className === '[object Function]' ||
        (typeof value.call !== 'undefined' &&
          typeof value.propertyIsEnumerable !== 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function'
      }
    } else {
      return 'null'
    }
  } else if (s === 'function' && typeof value.call === 'undefined') {
    return 'object'
  }
  return s
}

/**
 * 判断是否为空
 */
yuchg.isNull = function (val) {
  return val == null
}

/**
 * 判断是否非空
 */
yuchg.isDefAndNotNull = function (val) {
  return val != null
}

/**
 * 判断是否为数组
 */
yuchg.isArray = function (val) {
  return yuchg.typeOf(val) === 'array'
}

/**
 * 判断是否为类数组
 */
yuchg.isArrayLike = function (val) {
  var type = yuchg.typeOf(val)
  return type === 'array' || (type === 'object' && typeof val.length === 'number')
}

/**
 * 判断是否为函数
 */
yuchg.isFunction = function (val) {
  return yuchg.typeOf(val) === 'function'
}

/**
 * 判断是否为对象
 */
yuchg.isObject = function (val) {
  var type = typeof val
  return (type === 'object' && val != null) || type === 'function'
}

/**
 * 克隆对象（深度递归）
 */
yuchg.cloneObject = function (obj) {
  var type = yuchg.typeOf(obj)
  if (type === 'object' || type === 'array') {
    if (obj.clone) {
      return obj.clone()
    }
    var clone = type === 'array' ? [] : {}
    for (var key in obj) {
      clone[key] = yuchg.cloneObject(obj[key])
    }
    return clone
  }
  return obj
}

/**
 * 深度合并
 */
yuchg.extend = function (obj1, obj2) {
  if (yuchg.isObject(obj1) && yuchg.isObject(obj2)) {
    for (let prop in obj2) { //obj1无值,都有取obj2
      if (!obj1[prop]) {
        obj1[prop] = obj2[prop]
      } else { //递归赋值
        obj1[prop] = yuchg.extend(obj1[prop], obj2[prop])
      }
    }
  } else if (yuchg.isArray(obj1) && yuchg.isArray(obj2)) {
    // 两个都是数组，进行合并
    obj1 = obj1.concat(obj2)
  } else { //其他情况，取obj2的值
    obj1 = obj2
  }
  return obj1
}

/**
 * 继承对象
 */
yuchg.inherits = function (childCtor, parentCtor) {
  /** @constructor */
  function TempCtor() {}

  TempCtor.prototype = parentCtor.prototype
  childCtor.superClass_ = parentCtor.prototype
  childCtor.prototype = new TempCtor()
  /** @override */
  childCtor.prototype.constructor = childCtor

  childCtor.base = function (me, methodName, varArgs) {
    var args = new Array(arguments.length - 2)
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i]
    }
    return parentCtor.prototype[methodName].apply(me, args)
  }
}

/**
 * 计算中英文字节长度, 中文算2个字节
 */
yuchg.strByteLength = function (str) {
  var arr = str.match(/[^\x00-\xff]/ig)
  return str.length + (arr == null ? 0 : arr.length)
}

/**
 * 字符串trim
 */
yuchg.trimString = function (str) {
  return str.replace(/^\s+|\s+$/g, '')
}

/**
 * 合并数组并去重, 返回新数组
 */
yuchg.concatArray = function (arr1, arr2) {
  var arr = arr1.concat(arr2)
  return Array.from(new Set(arr))
}

export default yuchg
<template>
    <div :id="id" class="nom" style="position: relative">
        <svg class="canvas" width="800" height="600">
            <text id="info" class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="8"
                  transform="translate(128, 24) ">X: {{ location.x }} Y: {{ location.y }}
            </text>
            <g class="blocklyZoom" transform="translate(20,20)">
                <image width="36" height="36" y="44" xlink:href="../assets/zoom-out.svg"></image>
                <image width="36" height="36" y="0" xlink:href="../assets/zoom-in.svg"></image>
                <image width="36" height="36" y="88" xlink:href="../assets/zoom-reset.svg"></image>
                <image width="36" height="36" y="132" xlink:href="../assets/zoom-reset.svg"></image>
                <image width="36" height="36" y="176" xlink:href="../assets/zoom-reset.svg"></image>
            </g>
        </svg>
    </div>
</template>

<style>
    .container {

    }

    .nom {
        height: 100%;
        overflow: hidden;
    }

    .link {
        fill: none;
        stroke: #ccc;
        stroke-width: 1.5px;
    }

    .links path {
        stroke: #999;
        stroke-opacity: 0.6;
    }

    .links .inport {
        stroke: #f66;
        stroke-opacity: 0.6;
    }

    .links .outport {
        stroke: #66f;
        stroke-opacity: 0.6;
    }

    .nodes circle {
        stroke: #fff;
        stroke-width: 1.5px;
        fill: rgb(44, 160, 44);
    }

    .nodes rect {
        fill: rgb(255, 127, 14);
    }

    .nodes text {
        stroke: #333;
        stroke-width: 0.5px;
        font-size: 12px;
    }

    .nodes .selected {
        stroke: #f33;
        stroke-width: 3px;
    }

    .node--model circle {
        stroke: #fff;
        stroke-width: 1.5px;
        fill: rgb(44, 160, 44);
    }

    .node--interface circle {
        stroke: #fff;
        stroke-width: 1.5px;
        fill: rgb(255, 127, 14);
    }

    .node text {
        stroke: #333;
        stroke-width: 0.5px;
        font-size: 10px;
    }

    .node--port rect {
        stroke: #fff;
        stroke-width: 1.5px;
        fill: rgb(255, 127, 14);
    }

    .node--group text {
        stroke: #eee;
        stroke-width: 0.5px;
        fill: #eee;
        font-size: 12px;
    }

    .node .selected {
        stroke: #f33;
        stroke-width: 3px;
    }
</style>

<script>
  import $ from 'jquery'
  import axios from 'axios'
  import * as d3 from 'd3'

  var grapPoint = {x: 0, y: 0}
  var startDrag = false
  var serverurl = 'http://localhost:3030/api/v1/test/'

  var instance = axios.create({
    baseURL: serverurl,
    timeout: 1000
  });

  export default {
    name: 'nomview',
    data: function () {
      return {
        id: 'nom',
        location: {x: 0, y: 0}
      }
    },
    components: {},
    created: function () {
    },
    mounted: function () {
      var that = this
      var $svg = $(".canvas")
      const svg = d3.select(that.$el).select(".canvas")

      var resizeCanvas = function () {
        let $main = $('.el-main')
        that.width = $main[0].clientWidth
        that.height = $main[0].clientHeight
        svg.attr('width', that.width)
          .attr('height', that.height)
      }

      window.onresize = function () {
        resizeCanvas()
      }

      resizeCanvas()

      var currentOffset = {x: 0, y:0 }
      var currentZoomFactor = svg.currentScale ? svg.currentScale : 1.0
      var zoomBtn = $(".blocklyZoom image")
      const zoomRate = 1.1

      function clearWS() {
        d3.selectAll(".workspace").remove()
      }

      zoomBtn.each(function (index, elem) {
        $(this).mousedown(function () {
          if (index == 0) {
            currentZoomFactor /= zoomRate
          }
          else if (index == 1) {
            currentZoomFactor *= zoomRate
          }
          else if (index == 2) {
            currentZoomFactor = 1.0
            currentOffset.x = 0
            currentOffset.y =  0
            $(".workspace").each(function () {
              const m = this.getCTM();
              $(this).attr("transform", "translate(0,0) scale(1.0)")
            });
            return
          }
          else if (index == 3) {
            clearWS()
            return
          }
          else {
            clearWS()
            currentOffset.x = 0
            currentOffset.y =  0
            init(netgraph)
            return
          }

          $(".workspace").each(function () {
            const m = this.getCTM();
            currentOffset.x = Number(m.e)
            currentOffset.y =  Number(m.f)
            $(this).attr("transform", "translate(" + currentOffset.x + "," + currentOffset.y + ") " + "scale(" + currentZoomFactor + ")")
          });

        })
      })

      svg.on('mousedown',function () {
        grapPoint.x = event.pageX
        grapPoint.y = event.pageY
        startDrag = true
        return false
      }).on('mousemove', function () {
        var X = $svg.offset().left
        var Y = $svg.offset().top
        that.location.x = event.pageX - X
        that.location.y = event.pageY - Y

        if (startDrag) {
          var deltaX = event.pageX - grapPoint.x
          var deltaY = event.pageY - grapPoint.y
          grapPoint.x = event.pageX
          grapPoint.y = event.pageY

          $(".workspace").each(function () {
            var m = this.getCTM();
            currentOffset.x = Number(m.e) + deltaX
            currentOffset.y = Number(m.f) + deltaY
            $(this).attr("transform", "translate(" + currentOffset.x + "," + currentOffset.y + ") " + "scale(" + currentZoomFactor + ")")
          });
        }
      }).on('mouseup', function (e) {
        startDrag = false
      });


      var defs = svg.append("defs");

      var arrowMarker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "8")
        .attr("refY", "6")
        .attr("orient", "auto");

      var arrow_path = "M2,2 L10,6 L2,10 L2,2";

      arrowMarker.append("path")
        .attr("d", arrow_path)
        .attr("fill", "#000");

      var textBG = defs.append("filter")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "1")
        .attr("height", "1")
        .attr("id", "solid")

      textBG.append("feFlood")
        .attr("flood-color", "green")

      textBG.append("feComposite")
        .attr("in", "SourceGraphic")

      var ws = null
      var simulation = null

      // group类型 1: 模型  2: 接口  3: 输入端口  4 输出端口  5 模型聚合  6 版本
      var color = d3.scaleOrdinal(d3.schemeSet3);

      function groupName(group) {
        var name = ""
        switch (group) {
          case 1:
            name = "模型";
            break;
          case 2:
            name = "接口";
            break;
          case 3:
            name = "输入";
            break;
          case 4:
            name = "输出";
            break;
          case 5:
            name = "集合";
            break;
          case 6:
            name = "版本";
            break;
          default:
            name = "未知";
        }
        return name
      }

      function mapObject(objs) {
        var map = {}
        objs.forEach(function (v) {
          map['_' + v.id] = v
        })
        return map
      }

      function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
      }

      function radialRootPoint(x, y) {
        return [80 * Math.cos(x -= Math.PI / 2), 60 * Math.sin(x)];
      }

      function getRadian(x1, y1, x2, y2) {//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
        return Math.atan2(y1 - y2, x1 - x2)
      }

      function getAngle(x1, y1, x2, y2) {//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
        var a = Math.atan2(y1 - y2, x1 - x2)
        var angle = a * 180.0 / Math.PI
        if (angle < 0) {
          angle += 360
        }
        return angle
      }

      // 求圆形射线的交点
      function circleCollide(cx, cy, r, x, y) {
        var a = getRadian(cx, cy, x, y)
        return [cx + r * Math.cos(a -= Math.PI / 2.0), cy + r * Math.sin(a)]
      }

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(d) {
        d.fx = d3.event.x
        d.fy = d3.event.y
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null
        d.fy = null
      }

      function getBound(group, value) {
        if (group == 1) {
          var r = value && value > 1 ? 20 + value * 5 : 20
          return r + 4
        }
        else {
          var w = value && value > 1 ? value * 8 : 16
          return w * 1.5 / 2
        }
      }


      var nomdb = null
      var nodes_map = null
      var interfaces_map = null
      var netgraph = null
      var treegraph = null
      var modelgraph = null
      var intergraph = null

      axios.all(
        [
          instance.get('/getnom'),
          instance.get('/getnetwork'),
          instance.get('/getmodeltree'),
          instance.get('/getinterfacetree')
        ]
      )
        .then(axios.spread(function (nomRes, netRes, modelRes, interfaceRes) {

          nomdb = nomRes.data
          nodes_map = mapObject(nomdb.nodes)
          interfaces_map = mapObject(nomdb.interfaces)
          netgraph = netRes.data
          modelgraph = modelRes.data
          intergraph = interfaceRes.data
          init(netgraph)

        }))
        .catch(function (error) {
          console.log(error)
        })


      function init(graph) {
        ws = svg.append("g")
          .attr("class", "workspace")
          .attr("transform", "translate(" + currentOffset.x + "," + currentOffset.y + ") " + "scale(" + currentZoomFactor + ")")

        simulation = d3.forceSimulation()
          .force("link", d3.forceLink().id(function (d) {
            return d.id;
          }))
          .force("charge", d3.forceManyBody())
          .force("collide", d3.forceCollide(100))
          .force("center", d3.forceCenter(that.width / 2, that.height / 2));

        var link = ws.append("g")
          .attr("class", "links")
          .selectAll("path")
          .data(graph.links)
          .enter().append("path")
          .attr('stroke', function (d) {
            return d.source > 100 ? "#f66" : "#66f"
          })
          //.attr('stroke','gray')
          .attr("stroke-width", function (d) {
            return 1
          })
          .attr("marker-end", "url(#arrow)")

        //testdata = link
        var node = ws.append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(graph.nodes)
          .enter().append("g")
          .on('mouseover', function (d) {
            d3.select(this).selectAll('circle').classed('selected', true)
            d3.select(this).selectAll('rect').classed('selected', true)
          })
          .on('mouseout', function (d) {
            d3.select(this).selectAll('circle').classed('selected', false)
            d3.select(this).selectAll('rect').classed('selected', false)
          })
          .on('dblclick', function (d) {
            // 切换视图
            if (d.group == 1) {
              treegraph = prepareModelTreeGraph(d.id)
            }
            else {
              treegraph = prepareInterfaceTreeGraph(d.id)

            }
            initLocal(treegraph)
          })

        var model_node = node.filter(function (d) {
          return d.group == 1
        })
        var interface_node = node.filter(function (d) {
          return d.group == 2
        })

        var circles = model_node.append("circle")
          .attr("r", function (d) {
            return d.value && d.value > 1 ? 20 + d.value * 5 : 20;
          })
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        var rects = interface_node.append("rect")
          .attr("x", function (d) {
            return d.value && d.value > 1 ? -d.value * 4 : -8;
          })
          .attr("y", function (d) {
            return d.value && d.value > 1 ? -d.value * 4 : -8;
          })
          .attr("width", function (d) {
            return d.value && d.value > 1 ? d.value * 8 : 16;
          })
          .attr("height", function (d) {
            return d.value && d.value > 1 ? d.value * 8 : 16;
          })
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        var lables = node.append("text")
          .text(function (d) {
            return d.name;
          })
          .attr("text-anchor", function (d) {
            return d.group == 1 ? "middle" : "start"
          })
          .attr('x', function (d) {
            return d.group == 1 ? 0 : 10
          })
          .attr('y', function (d) {
            return 5
          })

        node.append("title")
          .text(function (d) {
            return d.id;
          });

        simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(graph.links);

        function ticked() {
          link.attr("d", function (d) {
            // 计算交点
            var a = getRadian(d.source.x, d.source.y, d.target.x, d.target.y)
            var src_bound = getBound(d.source.group, d.source.value)
            var src_offset = [d.source.x - src_bound * Math.cos(a), d.source.y - src_bound * Math.sin(a)]
            var target_bound = getBound(d.target.group, d.target.value)
            var target_offset = [d.target.x + target_bound * Math.cos(a), d.target.y + target_bound * Math.sin(a)]

            return "M " + src_offset + " L " + target_offset
          })

          node
            .attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            })
        }
      }

      function prepareModelTreeGraph(id) {
        var graph = modelgraph
        var node = nodes_map['_' + id]
        if (!node) {
          return null
        }

        var root = {"uid": 0, "id": id, "name": node.name, "parent": "", "group": 1}
        //graph.nodes.push(root)
        // 根据类型
        for (var item in node.inports) {
          //graph.nodes.push({ "name": item, "parent": root.name, "group": 3 })
          // 查找接口所有版本
        }
        for (var item in node.outports) {
          //graph.nodes.push({ "name": item, "parent": root.name, "group": 4 })
          // 查找接口所有版本
        }
        return graph
      }

      function prepareInterfaceTreeGraph(id) {
        var graph = intergraph
        var inter = interfaces_map['_' + id]
        if (!inter) {
          return null
        }
        var root = {"id": 0, "id": id, "name": inter.name, "parent": "", "group": 2}
        //graph.nodes.push(root)
        // 根据类型
        return graph
      }

      function initLocal(graph, offset = false) {
        clearWS()

        ws = svg.append("g")
          .attr("class", "workspace")
          .attr("transform", (offset ? "translate(" + currentOffset.x + "," + currentOffset.y + ") "  : "translate(" + (that.width / 2) + "," + (that.height / 2) + ")") + "scale(" + currentZoomFactor + ")" )

        var data = d3.stratify()
          .id(function (d) {
            return d.uid;
          })
          .parentId(function (d) {
            return d.parent;
          })
          (graph.nodes);

        var tree = d3.tree()
          .size([2 * Math.PI, 300])
          .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2)
          });


        var root = tree(data);

        var link = ws.selectAll(".link")
          .data(root.links())
          .enter().append("path")
          .attr("class", "link")


        var rootlink = link.filter(function (d) {
          return d.source.id == 0
        })

        var nrootlink = link.filter(function (d) {
          return d.source.id != 0
        })

        rootlink.attr("d", function (d) {
          return "M 0,0" + " L " + radialPoint(d.target.x, d.target.y)
        })

        nrootlink.attr("d", d3.linkRadial()
          .angle(function (d) {
            return d.x;
          })
          .radius(function (d) {
            return d.y;
          }));

        var node = ws.selectAll(".node")
          .data(root.descendants())
          .enter().append("g")
          .attr("class", function (d) {
            var cls = "node "
            var group = d.data.group
            if (group == 1) {
              cls += "node--model"
            }
            else if (group == 2) {
              cls += "node--interface"
            }
            else if (group < 5) {
              cls += "node--port"
            }
            else if (group == 5) {
              cls += "node--group"
            }
            else if (group == 6) {
              cls += "node--version"
            }
            return cls
          })
          .attr("transform", function (d) {
            return "translate(" + radialPoint(d.x, d.y) + ")";
          })
          .on('mouseover', function (d) {
            d3.select(this).selectAll('circle').classed('selected', true)
            d3.select(this).selectAll('rect').classed('selected', true)
          })
          .on('mouseout', function (d) {
            d3.select(this).selectAll('circle').classed('selected', false)
            d3.select(this).selectAll('rect').classed('selected', false)
          })
          .on('click', function (d) {
            if (d.id == 0) return
            if (d.data.group != 5) return

            // 切换视图

            var _this = d3.select(this)
            var _id = '_' + d.id
            var newnodes = []

            treegraph.nodes.forEach(function (v) {
              if (v["groupid"]) {
              }
              else {
                newnodes.push(v)
              }
            })

            for (var v in treegraph.groups) {
              if (v != _id) {
                newnodes.push(treegraph.groups[v])
              }
            }


            var m = treegraph.models[_id]
            if (m) {
              m.forEach(function (v) {
                newnodes.push(v)
              })
            }

            // 替换集合
            treegraph.nodes = newnodes

            initLocal(treegraph, true)
          })
          .on('dblclick', function (d) {
            if (d.id == 0) return
            if (d.data.group >= 5) return

            // 切换视图
            if (d.data.group == 1) {
              treegraph = prepareModelTreeGraph(d.data.id)
            }
            else if (d.data.group < 5) {
              treegraph = prepareInterfaceTreeGraph(d.data.id)
            }
            initLocal(treegraph, true)
          })

        var rnode = node.filter(function (d) {
          return d.id != 0 && (d.data.group == 2 || d.data.group == 3 || d.data.group == 4)
        })

        var cnode = node.filter(function (d) {
          return d.id == 0 || d.data.group == 1 || d.data.group >= 5
        })

        cnode.append("circle")
          .attr("r", function (d) {
            return d.id == 0 ? 50 : (d.data.group == 1 || d.data.group == 5) ? 25 : 5
          })


        rnode.append("rect")
          .attr("x", function (d) {
            return -5;
          })
          .attr("y", function (d) {
            return -5;
          })
          .attr("width", function (d) {
            return 10;
          })
          .attr("height", function (d) {
            return 10;
          })


        node.append("text")
          .attr("dy", "-0.31em")
          .attr("x", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5) ? 0 : d.x < Math.PI ? 6 : -6;
          })
          .attr("text-anchor", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5) ? "middle" : d.x < Math.PI ? "start" : "end";
          })
          .attr("transform", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5) ? "" : "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")";
          })
          //.attr("filter", "url(#solid)")
          .text(function (d) {
            return d.data.group == 5 ? "" : groupName(d.data.group);
          });
        node.append("text")
          .attr("dy", function (d) {
            return d.data.group == 5 ? "0.31em" : "1.0em"
          })
          .attr("x", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5 ) ? 0 : d.x < Math.PI ? 6 : -6;
          })
          .attr("text-anchor", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5 ) ? "middle" : d.x < Math.PI ? "start" : "end";
          })
          .attr("transform", function (d) {
            return (d.id == 0 || d.data.group == 1 || d.data.group == 5 ) ? "" : "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")";
          })
          //.attr("filter", "url(#solid)")
          .text(function (d) {
            return d.data.name;
          });

      }

    }
  }

</script>

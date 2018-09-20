var express = require('express')
var logs = require('../../logger')

const router = express.Router()

router.route('/getnom').get((req, res)=>{
  let data = {
    nodes: [
      {
        "id": 1, "name": "Destroyer", "value": 1,
        "inports": {"MissileInfo": "1.0.0", "MissileDamage": "1.0.0"},
        "outports": {"ShipInfo": "1.0.0"}
      },
      {
        "id": 2, "name": "Missile", "value": 2,
        "outports": {"MissileInfo": "1.0.0", "MissileDamage": "1.0.0"},
        "inports": {"ShipInfo": "1.0.0"}
      },
      {
        "id": 3, "name": "Carrier", "value": 1,
        "inports": {"MissileInfo": "1.0.0", "MissileDamage": "1.0.0"},
        "outports": {"ShipInfo": "1.0.0"}
      },
      {
        "id": 4, "name": "Submarine", "value": 1,
        "outports": {"ShipInfo": "1.0.0"}
      }
    ],
    interfaces: [
      {"id": 100, "name": "MissileInfo", "versions": {"0.1.0": [], "0.2.0": [], "1.0.0": ["Missile", "Destroyer"]}},
      {"id": 101, "name": "ShipInfo", "versions": {"0.1.0": [], "0.2.0": [], "1.0.0": ["Missile", "Destroyer"]}},
      {"id": 102, "name": "MissileDamage", "versions": {"0.1.0": [], "0.2.0": [], "1.0.0": ["Missile", "Destroyer"]}}
    ]
  }
  res.json(data)
})

router.route('/getnetwork').get((req, res) => {
  // 测试数据
  let data = {
    "nodes": [
      {"id": 1, "name": "Destroyer", "group": 1, "value": 3},
      {"id": 2, "name": "Missile", "group": 1, "value": 4},
      {"id": 3, "name": "Carrier", "group": 1, "value": 1},
      {"id": 4, "name": "Submarine", "group": 1, "value": 1},
      {"id": 5, "name": "ChaffJammingBomb", "group": 1, "value": 8},
      {"id": 101, "name": "ShipInfo", "group": 2},
      {"id": 102, "name": "MissileInfo", "group": 2},
      {"id": 103, "name": "MissileDamage", "group": 2},
      {"id": 104, "name": "FleetCommand", "group": 2},
      {"id": 105, "name": "FireBombCommand", "group": 2},
      {"id": 106, "name": "InterceptDamage", "group": 2},
    ],
    "links": [
      {"source": 1, "target": 101},
      {"source": 3, "target": 101},
      {"source": 4, "target": 101},
      {"source": 101, "target": 2},
      {"source": 2, "target": 102},
      {"source": 102, "target": 1},
      {"source": 102, "target": 3},
      {"source": 102, "target": 5},
      {"source": 2, "target": 103},
      {"source": 103, "target": 1},
      {"source": 103, "target": 3},
      {"source": 3, "target": 104},
      {"source": 104, "target": 1},
      {"source": 1, "target": 105},
      {"source": 3, "target": 105},
      {"source": 105, "target": 5},
      {"source": 5, "target": 106},
      {"source": 106, "target": 2},
    ]
  }
  res.json(data)
})

router.route('/getmodeltree').get((req, res) => {
  // 测试数据
  let data = {
    nodes: [
      {"uid": 0, "id": 2, "name": "Missile", "parent": null, "group": 1},
      {"uid": 1, "id": 102, "name": "MissileInfo", "parent": 0, "group": 4},
      {"uid": 2, "id": 103, "name": "MissileDamage", "parent": 0, "group": 4},
      {"uid": 3, "id": 101, "name": "ShipInfo", "parent": 0, "group": 3},
      {"uid": 101, "name": "2", "parent": 1, "group": 5, "groupid": 101},
      {"uid": 102, "name": "2", "parent": 2, "group": 5, "groupid": 102},
      {"uid": 103, "name": "3", "parent": 3, "group": 5, "groupid": 103}
    ],
    groups: {
      "_101": {"uid": 101, "name": "2", "parent": 1, "group": 5, "groupid": 101},
      "_102": {"uid": 102, "name": "2", "parent": 2, "group": 5, "groupid": 102},
      "_103": {"uid": 103, "name": "3", "parent": 3, "group": 5, "groupid": 103}
    },
    models: {
      "_101": [
        {"uid": 1001, "id": 1, "name": "Destroyer", "parent": 1, "group": 1, "groupid": 101},
        {"uid": 1002, "id": 3, "name": "Carrier", "parent": 1, "group": 1, "groupid": 101},
      ],
      "_102": [
        {"uid": 1003, "id": 1, "name": "Destroyer", "parent": 2, "group": 1, "groupid": 102},
        {"uid": 1004, "id": 3, "name": "Carrier", "parent": 2, "group": 1, "groupid": 102},
      ],
      "_103": [
        {"uid": 1005, "id": 1, "name": "Destroyer", "parent": 3, "group": 1, "groupid": 103},
        {"uid": 1006, "id": 3, "name": "Carrier", "parent": 3, "group": 1, "groupid": 103},
        {"uid": 1007, "id": 4, "name": "Submarine", "parent": 3, "group": 1, "groupid": 103},
      ]
    }
  }
  res.json(data)
})

router.route('/getinterfacetree').get((req, res) => {
  // 测试数据
  var data = {
    nodes: [
      {"uid": 0, "id": 101, "name": "MissileInfo", "parent": null, "group": 2},
      {"uid": 1, "name": "0.1.0", "parent": 0, "group": 6},
      {"uid": 2, "name": "0.2.0", "parent": 0, "group": 6},
      {"uid": 3, "name": "1.0.0", "parent": 0, "group": 6},
      {"uid": 4, "name": "1.1.0", "parent": 0, "group": 6},
      {"uid": 5, "name": "1.2.0", "parent": 0, "group": 6},
      {"uid": 6, "name": "1.3.0", "parent": 0, "group": 6},
      {"uid": 7, "name": "2.0.0", "parent": 0, "group": 6},
      {"uid": 8, "name": "2.1.0", "parent": 0, "group": 6},
      {"uid": 9, "name": "3.0.0", "parent": 0, "group": 6},
      {"uid": 10, "name": "4.0.0", "parent": 0, "group": 6},
      {"uid": 11, "name": "4.1.0", "parent": 0, "group": 6},
      {"uid": 12, "name": "4.2.0", "parent": 0, "group": 6},
      {"uid": 13, "name": "5.0.0", "parent": 0, "group": 6},
      {"uid": 14, "name": "6.0.0", "parent": 0, "group": 6},
      {"uid": 15, "name": "7.0.0", "parent": 0, "group": 6},
      {"uid": 16, "name": "8.0.0", "parent": 0, "group": 6},
      {"uid": 17, "name": "9.0.0", "parent": 0, "group": 6},
      {"uid": 18, "name": "10.0.0", "parent": 0, "group": 6},
      {"uid": 19, "name": "11.0.0", "parent": 0, "group": 6},
      {"uid": 20, "name": "11.1.0", "parent": 0, "group": 6},
      {"uid": 21, "name": "11.1.1", "parent": 0, "group": 6},
      {"uid": 22, "name": "12.0.0", "parent": 0, "group": 6},
      {"uid": 23, "name": "13.0.0", "parent": 0, "group": 6},
      {"uid": 24, "name": "14.0.0", "parent": 0, "group": 6},
      {"uid": 101, "name": "2", "parent": 3, "group": 5, "groupid": 101},
      {"uid": 102, "name": "4", "parent": 2, "group": 5, "groupid": 102},
      {"uid": 103, "name": "4", "parent": 4, "group": 5, "groupid": 103},
      {"uid": 104, "name": "4", "parent": 5, "group": 5, "groupid": 104},
      {"uid": 105, "name": "4", "parent": 6, "group": 5, "groupid": 105},
      {"uid": 106, "name": "4", "parent": 7, "group": 5, "groupid": 106},
    ],
    groups: {
      "_101": {"uid": 101, "name": "2", "parent": 3, "group": 5, "groupid": 101},
      "_102": {"uid": 102, "name": "4", "parent": 2, "group": 5, "groupid": 102},
      "_103": {"uid": 103, "name": "4", "parent": 4, "group": 5, "groupid": 103},
      "_104": {"uid": 104, "name": "4", "parent": 5, "group": 5, "groupid": 104},
      "_105": {"uid": 105, "name": "4", "parent": 6, "group": 5, "groupid": 105},
      "_106": {"uid": 106, "name": "4", "parent": 7, "group": 5, "groupid": 106}
    },
    models: {
      "_101": [
        {"uid": 1001, "id": 1, "name": "Destroyer", "parent": 3, "group": 1, "groupid": 101},
        {"uid": 1002, "id": 2, "name": "Missile", "parent": 3, "group": 1, "groupid": 101}
      ],
      "_102": [
        {"uid": 1003, "id": 1, "name": "Destroyer", "parent": 2, "group": 1, "groupid": 102},
        {"uid": 1004, "id": 2, "name": "Missile", "parent": 2, "group": 1, "groupid": 102},
        {"uid": 1005, "id": 3, "name": "Carrier", "parent": 2, "group": 1, "groupid": 102},
        {"uid": 1006, "id": 4, "name": "Submarine", "parent": 2, "group": 1, "groupid": 102}
      ],
      "_103": [
        {"uid": 1007, "id": 1, "name": "Destroyer", "parent": 4, "group": 1, "groupid": 103},
        {"uid": 1008, "id": 2, "name": "Missile", "parent": 4, "group": 1, "groupid": 103},
        {"uid": 1009, "id": 3, "name": "Carrier", "parent": 4, "group": 1, "groupid": 103},
        {"uid": 1010, "id": 4, "name": "Submarine", "parent": 4, "group": 1, "groupid": 103}
      ],
      "_104": [
        {"uid": 1011, "id": 1, "name": "Destroyer", "parent": 5, "group": 1, "groupid": 104},
        {"uid": 1012, "id": 2, "name": "Missile", "parent": 5, "group": 1, "groupid": 104},
        {"uid": 1013, "id": 3, "name": "Carrier", "parent": 5, "group": 1, "groupid": 104},
        {"uid": 1014, "id": 4, "name": "Submarine", "parent": 5, "group": 1, "groupid": 104}
      ],
      "_105": [
        {"uid": 1015, "id": 1, "name": "Destroyer", "parent": 6, "group": 1, "groupid": 105},
        {"uid": 1016, "id": 2, "name": "Missile", "parent": 6, "group": 1, "groupid": 105},
        {"uid": 1017, "id": 3, "name": "Carrier", "parent": 6, "group": 1, "groupid": 105},
        {"uid": 1018, "id": 4, "name": "Submarine", "parent": 6, "group": 1, "groupid": 105}
      ],
      "_106": [
        {"uid": 1019, "id": 1, "name": "Destroyer", "parent": 7, "group": 1, "groupid": 106},
        {"uid": 1020, "id": 2, "name": "Missile", "parent": 7, "group": 1, "groupid": 106},
        {"uid": 1021, "id": 3, "name": "Carrier", "parent": 7, "group": 1, "groupid": 106},
        {"uid": 1022, "id": 4, "name": "Submarine", "parent": 7, "group": 1, "groupid": 106}
      ]
    }
  }
  res.json(data)
})

module.exports = router
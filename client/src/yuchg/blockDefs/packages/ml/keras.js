export default [
  {
    id: 'keras-model',
    type: 'event',
    shape: 'cap',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '定义模型'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'Sequential', value: 0 }
              ]
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-dense-simple',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Dense'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-dense',
    type: 'control',
    shape: 'cup',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Dense'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-activation-simple',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Activation'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'softmax', value: 1 },
                { name: 'elu', value: 2 },
                { name: 'selu', value: 3 },
                { name: 'softplus', value: 4 },
                { name: 'softsign', value: 5 },
                { name: 'relu', value: 6 },
                { name: 'tanh', value: 7 },
                { name: 'sigmoid', value: 8 },
                { name: 'hard_sigmoid', value: 9 },
                { name: 'exponential', value: 10 },
                { name: 'linear', value: 11 }
              ]
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-dropout-simple',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Dropout'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 0.5
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-conv1d-simple',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Conv1D'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-conv2d-simple',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'Conv2D'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          }
        ]
      }
    }
  },
  {
    id: 'keras-param-string',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 4,
          right: 4,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'string',
        sections: [
          {
            type: 'text',
            text: '设置参数'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'padding', value: 0 },
                { name: 'data_format', value: 1 }
              ]
            }
          },
          {
            type: 'text',
            text: '='
          },
          {
            type: 'argument',
            datatype: 'string'
          }
        ]
      }
    }
  },
  {
    id: 'keras-param-number',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 4,
          right: 4,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'string',
        sections: [
          {
            type: 'text',
            text: '设置参数'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'kernel_size', value: 0 },
                { name: 'strides', value: 1 },
                { name: 'dilation_rate', value: 1 }
              ]
            }
          },
          {
            type: 'text',
            text: '='
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'keras-param-number2',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '设置参数'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'input_shape', value: 0 }
              ]
            }
          },
          {
            type: 'text',
            text: '='
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'keras-kernelsize',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'kernel_size ='
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'keras-param-bool',
    type: 'action',
    shape: 'slot',
    category: 'custom',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '设置参数'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'use_bias', value: 0 }
              ]
            }
          },
          {
            type: 'text',
            text: '='
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: 'True', value: 1 },
                { name: 'False', value: 0 }
              ]
            }
          }
        ]
      }
    }
  }
]

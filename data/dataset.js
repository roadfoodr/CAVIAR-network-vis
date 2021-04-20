dataset = ({
  nodes: [
  {
    "id":"n1",
    "color":1,
    "full_name":"Manny",
  },
  {
    "id":"n2",
    "color":2,
    "full_name":"Moe",
  },
  {
    "id":"n3",
    "color":3,
    "full_name":"Jack",
  },
  {
    "id":"n4",
    "color":4,
    "full_name":"Jill",
  },
],
  links: [
    {source: "n1", target: "n2"},
    {source: "n2", target: "n3"},

  ]
    })
    
dataset2 = ({
  nodes: [
  {
    "id":"n1",
    "color":1,
    "full_name":"Manny",
  },
  {
    "id":"n3",
    "color":3,
    "full_name":"Jack",
  },
  {
    "id":"n4",
    "color":4,
    "full_name":"Jill",
  },
  {
    "id":"n5",
    "color":5,
    "full_name":"Johnny",
  },
  {
    "id":"n2",
    "color":2,
    "full_name":"Moe",
  },
],
  links: [
    {source: "n1", target: "n2"},
    {source: "n2", target: "n3"},
    {source: "n4", target: "n5"},

  ]
    })

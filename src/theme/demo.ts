export const airbnbCard = {
  root: {
    id: "root",
    parent: "root",
    type: "box",
    children: ["comp-1580479567"],
    props: {}
  },
  "comp-1580479567": {
    id: "comp-1580479567",
    props: {
      bg: "#ffffff",
      rounded: "lg",
      width: "sm",
      minHeight: "sm",
      border: "1px solid lightgrey",
      overflow: "hidden"
    },
    children: ["comp-1580479581", "comp-1580479627"],
    type: "Box",
    parent: "root"
  },
  "comp-1580479581": {
    id: "comp-1580479581",
    props: {},
    children: ["comp-1580479588"],
    type: "Box",
    parent: "comp-1580479567"
  },
  "comp-1580479588": {
    id: "comp-1580479588",
    props: {
      size: "100px",
      fallbackSrc: "https://via.placeholder.com/150",
      src:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      width: "100%",
      height: "auto"
    },
    children: [],
    type: "Image",
    parent: "comp-1580479581"
  },
  "comp-1580479627": {
    id: "comp-1580479627",
    props: {
      p: "5",
      pb: "8"
    },
    children: [
      "comp-1580479631",
      "comp-1580479743",
      "comp-1580479791",
      "comp-1580479811"
    ],
    type: "Box",
    parent: "comp-1580479567"
  },
  "comp-1580479631": {
    id: "comp-1580479631",
    props: {
      display: "flex",
      justifyContent: "start",
      alignItems: "center",
      mb: "1"
    },
    children: ["comp-1580479639", "comp-1580479654"],
    type: "Box",
    parent: "comp-1580479627"
  },
  "comp-1580479639": {
    id: "comp-1580479639",
    props: {
      children: "NEW",
      variant: "subtle",
      variantColor: "teal",
      mr: "2",
      rounded: "lg",
      pl: "2",
      pr: "2"
    },
    children: [],
    type: "Badge",
    parent: "comp-1580479631"
  },
  "comp-1580479654": {
    id: "comp-1580479654",
    props: {
      children: "3 BEDS • 2 BATHS",
      color: "gray.500",
      fontSize: "xs"
    },
    children: [],
    type: "Text",
    parent: "comp-1580479631"
  },
  "comp-1580479743": {
    id: "comp-1580479743",
    props: {
      children: "Modern home in city center",
      fontWeight: "bold",
      fontSize: "xl"
    },
    children: [],
    type: "Text",
    parent: "comp-1580479627"
  },
  "comp-1580479791": {
    id: "comp-1580479791",
    props: {
      children: "$119/night",
      fontSize: "sm",
      mb: "3"
    },
    children: [],
    type: "Text",
    parent: "comp-1580479627"
  },
  "comp-1580479811": {
    id: "comp-1580479811",
    props: {
      display: "flex",
      alignItems: "center",
      mb: ""
    },
    children: ["comp-1580479816", "comp-1580479832", "comp-1580479862"],
    type: "Box",
    parent: "comp-1580479627"
  },
  "comp-1580479816": {
    id: "comp-1580479816",
    props: {
      name: "star",
      color: "yellow.400",
      mr: "1"
    },
    children: [],
    type: "Icon",
    parent: "comp-1580479811"
  },
  "comp-1580479832": {
    id: "comp-1580479832",
    props: {
      children: "4.84",
      fontWeight: "bold",
      mr: "1"
    },
    children: [],
    type: "Text",
    parent: "comp-1580479811"
  },
  "comp-1580479862": {
    id: "comp-1580479862",
    props: {
      children: "(190)",
      fontSize: "sm"
    },
    children: [],
    type: "Text",
    parent: "comp-1580479811"
  }
};

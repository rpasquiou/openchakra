import React, { memo, useState, useEffect } from 'react'
import Graph from "react-graph-vis"

const Sitemap = ({ links }) => {

  const [graph, setGraph]=useState({links:[], edges:[]})

  const options = {
    layout: {
      hierarchical: false
    },
    edges: {
      color: "#000000"
    },
    stabilization: true,
    //height: "500px"
  }
  const events={}

  useEffect(()=> {
    setGraph({nodes: links.nodes, edges: links.edges})
  }, [ŀinks])

  return (
    <Graph
      graph={graph}
      options={options}
      events={events}
    />
  )

}

export default Sitemap

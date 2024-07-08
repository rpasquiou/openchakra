import React, { FC, useEffect, useState, useRef } from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { getModels } from '~core/selectors/dataSources';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

const TYPES = {
  String: '#f8d7da',
  Date: '#d1ecf1',
  Number: '#fff3cd',
  Boolean: '#d4edda'
};

const generateDot = (models) => {
  let dot = 'digraph G {\n rankdir=LR;\n node [shape=plaintext];\n splines=ortho;\n'
  const edges = new Set();

  const DEFAULT_ATTRIBUTES = ['start_date', 'end_date', 'name', 'firstname', 'lastname'];

  const getFilteredAttributes = (attributes) => {
    return Object.keys(attributes).filter(attr => !DEFAULT_ATTRIBUTES.includes(attr));
  };

  const modelsWithAttributes = Object.keys(models).map(m => {
    const attributes = models[m].attributes;
    const filteredAttributes = getFilteredAttributes(attributes);
    return {
      model: m,
      attributes: filteredAttributes
    };
  });
  console.log(modelsWithAttributes)

  const compositions = modelsWithAttributes.map(m=> {
    
  })

  Object.keys(models).forEach(m => {
    dot += `  ${m} [label=<
      <table border="0" cellborder="1" cellspacing="0">
        <tr><td bgcolor="#cccccc" colspan="2"><b>${m}</b></td></tr>`;
    const attributes = models[m].attributes || {};
    Object.keys(attributes).forEach(a => {
      if (a.includes('.')) return;
      const attr = attributes[a] || {};
      const bgColor = TYPES[attr.type] || '#ffffff';
      let type;
      if (TYPES[attr.type]) {
        type = attr.type;
      } else {
        type = 'Ref';
        if (attr.ref && !edges.has(`${m} -> ${attr.type}`)) {
          edges.add(`${m} -> ${attr.type}`);
        }
      }
      dot += `<tr><td bgcolor="${bgColor}">${a}</td><td bgcolor="${bgColor}">${type}</td></tr>`;
    });
    dot += `</table>>];\n`;
  });

  edges.forEach(edge => {
    dot += `  ${edge};\n`;
  });

  dot += '}';
  return dot;
};

const Diagram: FC = () => {
  const models = useSelector(getModels);
  const [svgContent, setSvgContent] = useState('');
  const svgContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const dot = generateDot(models);
    const viz = new Viz({ Module, render });
    viz.renderSVGElement(dot)
      .then(svg => setSvgContent(svg.outerHTML))
      .catch(error => console.error(error));
  }, [models]);

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault();
      const scaleAmount = event.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel(prev => Math.min(Math.max(prev * scaleAmount, 0.2), 5));
    };

    const svgContainer = svgContainerRef.current;
    svgContainer.addEventListener('wheel', handleWheel);

    return () => {
      svgContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleOpenInNewTab = () => {
    const newWindow = window.open();
    newWindow.document.write(svgContent);
    newWindow.document.close();
  };

  const handleExport = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setScrollStart({
      x: svgContainerRef.current.scrollLeft,
      y: svgContainerRef.current.scrollTop
    });
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    svgContainerRef.current.scrollLeft = scrollStart.x - dx;
    svgContainerRef.current.scrollTop = scrollStart.y - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Box>
      <HStack spacing="4">
        <Button onClick={handleOpenInNewTab}>Open Diagram in New Tab</Button>
        <Button onClick={handleExport}>Export Diagram</Button>
      </HStack>
      <Box
        ref={svgContainerRef}
        overflow="auto"
        maxH="80vh"
        border="1px solid #ccc"
        p="4"
        mt="4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        cursor={isDragging ? 'grabbing' : 'grab'}
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: '0 0',
            width: 'fit-content',
            height: 'fit-content'
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </Box>
    </Box>
  );
};

export default Diagram;

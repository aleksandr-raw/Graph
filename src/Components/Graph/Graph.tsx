import cytoscape, {Core} from 'cytoscape';
import {useCallback, useEffect, useRef, useState} from "react";
import './Graph.css';

const style = [
    {
        selector: 'node',
        style: {
            'background-color': '#0074D9',
            'label': 'data(id)',
            'color': 'white',
            'border-color': '#001f3f',
            'border-width': '2px',
            'font-size': '12px'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#7FDBFF',
            'target-arrow-color': '#7FDBFF',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
        }
    }
];

const layout = {
    name: 'circle',
    animate: true,
    animationDuration: 350,
}

export const Graph = () => {
    const container = useRef(null);
    const [cy, setCy] = useState<Core | null>(null);

    const downloadGraph = useCallback(() => {
        if (cy) {
            const pngBlob = cy.png({output: 'blob'});
            const url = URL.createObjectURL(pngBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph.png';
            a.click();
        }
    }, [cy])

    const generateElements = useCallback(() => {
        const numNodes = Math.floor(Math.random() * 46) + 5;
        let nodes = [];
        let edges = [];
        let componentStart = 0;

        for (let i = 0; i < numNodes; i++) {
            nodes.push({data: {id: `node${i}`}});

            if (i > componentStart) {
                if (Math.random() < 0.2 && i - componentStart >= 2) {
                    componentStart = i;
                } else {
                    const targetIndex = componentStart + Math.floor(Math.random() * (i - componentStart));
                    edges.push({
                        data: {
                            source: `node${i}`,
                            target: `node${targetIndex}`
                        }
                    });
                }
            }
        }

        if (numNodes - componentStart < 2) {
            const targetIndex = Math.floor(Math.random() * componentStart);
            edges.push({
                data: {
                    source: `node${numNodes - 1}`,
                    target: `node${targetIndex}`
                }
            });
        }

        return [...nodes, ...edges];
    }, []);

    const refreshGraph = useCallback(() => {
        const elements = generateElements();

        const cy = cytoscape({
            container: container.current,
            elements,
            style,
            layout
        });

        setCy(cy);

    }, [generateElements]);

    useEffect(() => {
        refreshGraph();
    }, [refreshGraph]);

    return (
        <div>
            <div ref={container}
                 className={'container'}
            />
            <button className={'btn-download'}
                    onClick={downloadGraph}>Download graph
            </button>
            <button className={'btn-random'}
                    onClick={refreshGraph}>Random
            </button>
        </div>
    );
};

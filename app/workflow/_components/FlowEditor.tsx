"use client"

import { Workflow } from '@prisma/client'
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import React, { useCallback, useEffect } from 'react'
import "@xyflow/react/dist/style.css";
import NodeComponent from './nodes/nodeComponent';
import { AppNode } from '@/types/appNode';
import { CreateFlowNode } from '@/lib/workflow/createFlowNode';
import { TaskType } from '@/types/task';
import DeletableEdge from './edges/DeletableEdge';
 
const nodeTypes = {
    FSNode: NodeComponent,
};

const edgeTypes = {
    default: DeletableEdge,
};

const snapGrid: [number, number] = [50, 50];
const fitViewOptions = {padding: 0.5};

function FlowEditor({workflow}: {workflow: Workflow}) {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();
    console.log(nodes);
    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if(!flow) return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []); 
            if(!flow.viewport) return;
            const { x = 0, y = 0, zoom = 1} = flow.viewport;
            setViewport({x, y, zoom});  
        } catch (error) {}
    }, [workflow.definition, setEdges, setNodes]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const taskType = event.dataTransfer.getData("application/reactflow");
        if(typeof taskType === undefined || !taskType) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        const newNode = CreateFlowNode(taskType as TaskType, position);
        setNodes((nds) => nds.concat(newNode));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) => addEdge({...connection, animated: true}, eds));
        if(!connection.targetHandle) return;

        //remove input value if its present on connection
        const node = nodes.find((nd) => nd.id === connection.target);
        if(!node) return;
        const nodeInputs = node.data.inputs;
        updateNodeData(node.id, {
            inputs: {
                ...nodeInputs,
                [connection.targetHandle]: "",
            },
        });
        console.log("updated: ", node.id);
    }, [setEdges, updateNodeData]);
    
  return (
    <main className="h-full w-full">
        <ReactFlow 
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={true}
        snapGrid={snapGrid}
        fitViewOptions={fitViewOptions}
        fitView
        onDragOver={onDragOver}
        onDrop={onDrop}
        onConnect={onConnect}>
            <Controls position="top-left" 
            fitViewOptions={fitViewOptions}/>
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> 
        </ReactFlow>
    </main>
  )
}

export default FlowEditor
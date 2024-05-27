import React, { useEffect, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils, react, useEditor, createShapeId  } from 'tldraw';
import { HTMLContainer, ShapeUtil } from 'tldraw'
import { useFish } from "@pages/content/ui/ScriptHelpers/FishOrchestrationProvider/FishOrchestrationProvider.jsx";
import _ from 'lodash';

import { handleDoubleClickOnCanvas } from './RichTextShape/canvasOverride.jsx';
// IMPORTING UI
import CustomToolbar from './CustomUI/CustomToolbar/CustomToolbar.jsx';
import { ContentTool } from './CustomUI/CustomToolbar/CustomTools/ContentTool.tsx';

import { FishShapeUtil } from './FishShape/FishShape.tsx'
import { ContentShapeUtil } from './ContentShape/ContentShape.tsx'
import { RichTextShapeUtil } from "@pages/content/ui/ShadowDOMOutlet/ShadowFishCanvas/RichTextShape/RichTextShapeUtil.tsx"

// import text tool

import { RichTextShapeTool } from "@pages/content/ui/ShadowDOMOutlet/ShadowFishCanvas/RichTextShape/RichTextShapeTool.tsx"

export default function ShadowCanvas({ parsedContent, article }) {
//   const [store] = useState(() => createTLStore({ shapeUtils }));
  const customShapeUtils = [FishShapeUtil, ContentShapeUtil, RichTextShapeUtil]
  const customTools = [
    RichTextShapeTool
]
  const customComponents = {
    Toolbar: null,
    HelpMenu: null,
    MainMenu: null,

  }

  const uiOverrides = {
    tools(editor, tools){
       console.log("TOOLS:", tools)

       tools.select = {
        ...tools.select,
        
       }
        // tools.content = {
        //     id: 'richText',
        //     icon: 'content-icon',
        //     label: "Text",
        //     kbd: 't',
        //     onSelect: () => {
        //         editor.setCurrentTool('richText')
        //     }
        // }

        return tools
    }
  }

  const [reactEditor, setReactEditor] = useState('')
  const [hoveredShape, setHoveredShape] = useState(undefined)
  const [selectedShapes, setSelectedShapes] = useState([])
  const { fishOrchestrator } = useFish();
  
  const [textCreated, setTextCreated] = useState(null)

  // useEffect(()=>{
  //   console.debug("SELECTED SHAPES:", selectedShapes)
  // }, [selectedShapes])


  // useEffect(()=>{
  //   console.log("HOVERED SHAPE:", hoveredShape)
  // }, [hoveredShape])

  useEffect(()=>{
    console.log("SELECTED SHAPES:", selectedShapes)
    if(textCreated && (selectedShapes && selectedShapes.length === 0)){
        console.log("TRIGGERED!", textCreated)
        if(reactEditor){
          const shapeGeometry = reactEditor.getShapeGeometry(textCreated.id)
          console.log("CORRECT SHAPE:", shapeGeometry)
          

          const textShape = reactEditor.getShape(textCreated.id)

          console.log("RICH TEXT SHAPE:", textShape)

          fishOrchestrator.emit('textCreated', { 
            x: textCreated.x, 
            y: textCreated.y , 
            w: shapeGeometry.w,
            h: shapeGeometry.h,
            text: textShape.props.text
        })
        }

        
        setTextCreated(null)
    }
  }, [textCreated, selectedShapes])



  function handleCanvasEvent(e, editor){
    if(editor){  
      switch(e.name){
          case 'pointer_up':
              // ripple effect
            
              const newSelectedShapes = editor.getSelectedShapes();
              const newHoveredShape = editor.getHoveredShape();

              console.log("POINTER UP:", newSelectedShapes)

                // Compare and update state only if different
                if (selectedShapes !== newSelectedShapes) {
                  setSelectedShapes(newSelectedShapes);
                }

                if (hoveredShape !== newHoveredShape) {
                  setHoveredShape(newHoveredShape);
                }

              // fishOrchestrator.emit('shadowDOMClick', { x: e.point.x, y: e.point.y })
              break;
          // case "double_click":
          //       const editorSelectedShapes = editor.getSelectedShapes()
          //       if (editorSelectedShapes.length > 0) break;
          //       editor.setCurrentTool("richText") // Or any other wanted tool
          //       const id = createShapeId()
          //       editor.createShapes([
          //         {
          //           id,
          //           type: 'richText',
          //           x: e.point.x,
          //           y: e.point.y,
          //           props: {
          //             text: '',
          //             autoSize: true,
          //           },
          //         },
          //       ]).select(id)
          //       editor.setEditingShape(id)
          //       // editor.setCurrentTool('select')
          //       // editor.root.getCurrent()?.transition('editing_shape')
          //       break
            
          default:
              break;
      }
    }
  }


  function handleStoreEvent(change){


        for (const record of Object.values(change.changes.added)) {
            if (record.typeName === 'shape') {
                console.log(`created shape (${record.type})\n`)
                console.log("RECORD:", record)
                if(record.type === 'richText'){
                    setTextCreated(record)
                }
            }

        for (const [from, to] of Object.values(change.changes.updated)) {
            if (
                from.typeName === 'instance' &&
                to.typeName === 'instance' &&
                from.currentPageId !== to.currentPageId
            ) {
                logChangeEvent(`changed page (${from.currentPageId}, ${to.currentPageId})`)
            } else if (from.id.startsWith('shape') && to.id.startsWith('shape')) {
                let diff = _.reduce(
                    from,
                    (result, value, key) =>
                        _.isEqual(value, (to)[key]) ? result : result.concat([key, (to)[key]]),
                    []
                )
                if (diff?.[0] === 'props') {
                    diff = _.reduce(
                        (from).props,
                        (result, value, key) =>
                            _.isEqual(value, (to).props[key])
                                ? result
                                : result.concat([key, (to).props[key]]),
                        []
                    )
                }
                console.log("UPDATED SHAPE:", diff)
                logChangeEvent(`updated shape (${JSON.stringify(diff)})\n`)
            }
        }

        for (const record of Object.values(change.changes.removed)) {
            if (record.typeName === 'shape') {
                logChangeEvent(`deleted shape (${record.type})\n`)
            }
        }
    }
  }

  // function handleChange(e, editor) {
  //   if (editor) {
  //       // const editorState = editor.getInstanceState()
  //       // editorState?.isFocused && console.debug('EDITOR FOCUS STATE::', editorState.isFocused)
  //       // TODO: long-term want an event listener specific to this
  //     const newSelectedShapes = editor.getSelectedShapes();
  //     const newHoveredShape = editor.getHoveredShape();

  //     // Compare and update state only if different
  //     if (selectedShapes !== newSelectedShapes) {
  //       setSelectedShapes(newSelectedShapes);
  //     }

  //     if (hoveredShape !== newHoveredShape) {
  //       setHoveredShape(newHoveredShape);
  //     }
  //   }
  // }

  function handleUiEvent(e){
    console.log("UI EVENT", e)
  }

  return (
    <Tldraw
      shapeUtils={customShapeUtils}
      tools={customTools}
      overrides={uiOverrides}
      components={customComponents}
  

      onUiEvent={handleUiEvent}
      onMount={(editor)=>{
        setReactEditor(editor)
        editor.root.children.select.children.idle.handleDoubleClickOnCanvas = (parent, info) => handleDoubleClickOnCanvas(editor, info, parent)
        editor.on('event', (event) => handleCanvasEvent(event, editor))
        // editor.on('change', (event) => handleChange(event, editor))
        // editor.on('', (e) => console.log("SELECTION CHANGE", e))
        editor.store.listen(handleStoreEvent)
        editor.createShapes(
            [
                {type: 'content', props: { content: article?.title ? article.title : "Untitled", contentType: 'header'}},
                {type: 'content', props: { content: article?.siteName ? article.siteName : "No site", contentType: 'paragraph'}}
            ]   
        )
      }}
    >
        <CustomToolbar />
    </Tldraw>
  );
}
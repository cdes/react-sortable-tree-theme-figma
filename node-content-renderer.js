import React, { Component } from "react";
import PropTypes from "prop-types";
import "./node-content-renderer.css";
import { getEmptyImage } from "react-dnd-html5-backend";

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== "function" &&
    older.children.some(
      child => child === younger || isDescendant(child, younger)
    )
  );
}

// eslint-disable-next-line react/prefer-stateless-function
class FileThemeNodeContentRenderer extends Component {
  render() {
    const {
      scaffoldBlockPxWidth,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      icons,
      buttons,
      className,
      style,
      didDrop,
      lowerSiblingCounts,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      treeId, // Not needed, but preserved for other renderers
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      rowDirection,
      isSelected,
      ...otherProps
    } = this.props;

    const nodeTitle = title || node.title;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, i) => {
      scaffold.push(
        <div
          key={`pre_${1 + i}`}
          style={{ width: scaffoldBlockPxWidth }}
          className="lineBlock"
        />
      );

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = "";

        if (listIndex === swapFrom + swapLength - 1) {
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = "highlightBottomLeftCorner";
        } else if (treeIndex === swapFrom) {
          // This block is on the top (source) line
          highlightLineClass = "highlightTopLeftCorner";
        } else {
          // This block is between the bottom and top
          highlightLineClass = "highlightLineVertical";
        }

        scaffold.push(
          <div
            key={`highlight_${1 + i}`}
            style={{
              width: scaffoldBlockPxWidth,
              left: scaffoldBlockPxWidth * i
            }}
            className={`absoluteLineBlock ${highlightLineClass}`}
          />
        );
      }
    });
    connectDragPreview(getEmptyImage());
    const nodeContent = (
      <div
        style={{ height: "100%" }}
        className={`${isSelected ? "node-list-selected-node" : ""}`}
        {...otherProps}
      >
        <div
          className={`
            rowWrapper ${!canDrag ? " rowWrapperDragDisabled" : ""}
          `}
        >
          {/* Set the row preview to be used during drag and drop */}
          <div style={{ display: "flex", width: "100%" }}>
            {scaffold}
            {toggleChildrenVisibility &&
              node.children &&
              node.children.length > 0 && (
                <button
                  type="button"
                  aria-label={node.expanded ? "Collapse" : "Expand"}
                  className={node.expanded ? "collapseButton" : "expandButton"}
                  onClick={() =>
                    toggleChildrenVisibility({
                      node,
                      path,
                      treeIndex
                    })
                  }
                >
                  {node.expanded ? (
                    <svg
                      width="6"
                      height="6"
                      viewBox="0 0 6 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 5L6 1H0L3 5Z" fill="#B3B3B3" />
                    </svg>
                  ) : (
                    <svg
                      width="6"
                      height="6"
                      viewBox="0 0 6 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 3L1 0V6L5 3Z" fill="#B3B3B3" />
                    </svg>
                  )}
                </button>
              )}
            <div
              className={`
                  row
                  ${isLandingPadActive ? " rowLandingPad" : ""}
                  ${isLandingPadActive && !canDrop ? " rowCancelPad" : ""}
                  ${isSearchMatch ? " rowSearchMatch" : ""}
                  ${isSearchFocus ? " rowSearchFocus" : ""}
                  ${className ? ` ${className}` : ""}
                `}
              style={{
                opacity: isDraggedDescendant ? 0.5 : 1,
                ...style
              }}
            >
              <div
                className={`
                    rowContents
                    ${!canDrag ? ` rowContentsDragDisabled` : ""}
                  `}
              >
                <div className="rowToolbar">
                  {icons.map((icon, index) => (
                    <div
                      key={index} // eslint-disable-line react/no-array-index-key
                      className="toolbarButton"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
                <div className="rowLabel">
                  <span className="rowTitle">
                    {typeof nodeTitle === "function"
                      ? nodeTitle({
                          node,
                          path,
                          treeIndex
                        })
                      : nodeTitle}
                  </span>
                </div>

                <div className="rowToolbar">
                  {buttons.map((btn, index) => (
                    <div
                      key={index} // eslint-disable-line react/no-array-index-key
                      className="toolbarButton"
                    >
                      {btn}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: "move" })
      : nodeContent;
  }
}

FileThemeNodeContentRenderer.defaultProps = {
  buttons: [],
  canDrag: false,
  canDrop: false,
  className: "",
  draggedNode: null,
  icons: [],
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: null,
  style: {},
  swapDepth: null,
  swapFrom: null,
  swapLength: null,
  title: null,
  toggleChildrenVisibility: null
};

FileThemeNodeContentRenderer.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.node),
  canDrag: PropTypes.bool,
  className: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isSearchFocus: PropTypes.bool,
  isSearchMatch: PropTypes.bool,
  listIndex: PropTypes.number.isRequired,
  lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  style: PropTypes.shape({}),
  swapDepth: PropTypes.number,
  swapFrom: PropTypes.number,
  swapLength: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  toggleChildrenVisibility: PropTypes.func,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,
  rowDirection: PropTypes.string.isRequired,

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  isDragging: PropTypes.bool.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  // Drop target
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool.isRequired
};

export default FileThemeNodeContentRenderer;

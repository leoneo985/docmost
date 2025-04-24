import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useMemo } from "react";
import { Image } from "@mantine/core";
import { getFileUrl } from "@/lib/config.ts";
import clsx from "clsx";

export default function ImageView(props: NodeViewProps) {
  const { node, selected, editor } = props;
  const { src, width, align, title } = node.attrs;

  // Log the received width attribute
  console.log('[ImageView] Render/Update - Received width:', width, '(type:', typeof width, ')');

  const isEditable = editor.isEditable;

  const alignClass = useMemo(() => {
    if (align === "left") return "alignLeft";
    if (align === "right") return "alignRight";
    if (align === "center") return "alignCenter";
    return "alignCenter";
  }, [align]);

  const wrapperClassName = "tiptap-image-view-wrapper";

  // Define styles dynamically for BOTH wrapper and image
  const wrapperStyle: React.CSSProperties = {};
  const imageStyle: React.CSSProperties = {
    display: 'block', // Image should be block inside its wrapper
    height: 'auto',
    maxWidth: '100%', // Image max-width relative to wrapper
  };

  // Handle alignment and wrapper width
  if (align === 'center') {
    wrapperStyle.display = 'block';
    wrapperStyle.marginLeft = 'auto';
    wrapperStyle.marginRight = 'auto';
    // Apply width to centered wrapper too if set
    if (width && typeof width === 'string' && width.includes('%')) {
      wrapperStyle.width = width;
    }
  } else {
    // Left or Right alignment - wrapper is inline-block
    wrapperStyle.display = 'inline-block';
    // Apply width to inline-block wrapper if set
    if (width && typeof width === 'string' && width.includes('%')) {
      wrapperStyle.width = width;
    }
    // Float is handled by CSS classes .alignLeft / .alignRight
  }
  
  // Safeguard for potential numeric width (though current logs show %)
  if (width && typeof width === 'number' && width > 0) {
      wrapperStyle.width = `${width}px`;
  }

  return (
    <NodeViewWrapper className={clsx(wrapperClassName, alignClass)} style={wrapperStyle}>
      {/* Image style primarily controls height/max-width relative to wrapper */}
      <Image 
        radius="md"
        fit="contain"
        src={getFileUrl(src)}
        alt={title}
        className={clsx('tiptap-image-content', selected && isEditable ? "ProseMirror-selectednode" : "")}
        style={imageStyle} 
      />
    </NodeViewWrapper>
  );
}

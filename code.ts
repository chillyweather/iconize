// @ts-nocheck

//* basic color style creation
//#region create styles

function ifAdminStyleExists() {
  const styles = figma.getLocalPaintStyles();
  return styles.some((style) => style.name === "BM Admin Color");
}

function createPaintStyle(name, r, g, b) {
  const baseStyle = figma.createPaintStyle();
  baseStyle.name = name;
  const col = { r: r, g: g, b: b };
  const paint = {
    type: "SOLID",
    color: col,
  };
  baseStyle.paints = [paint];
  return baseStyle;
}

function localStyle() {
  const styles = figma.getLocalPaintStyles();
  const newStyle = styles.find((style) => style.name === "BM Admin Color");
  return newStyle;
}

function clone(val: any): any {
  return JSON.parse(JSON.stringify(val));
}
//#endregion

function detachInstance(node) {
  if (node.type === "INSTANCE") {
    return node.detachInstance();
  }
  return node;
}

function vectorToOutline(vector) {
  if (vector.strokes.length > 0 && vector.strokeWeight !== 0) {
    const parent = vector.parent;
    console.log(vector.strokeWeight);
    const outlinedStroke = vector.outlineStroke();
    console.log(outlinedStroke);
    parent.appendChild(outlinedStroke);
    vector.remove();
  }
}

function iconCoreFix(node) {
  console.log(node);
  const vectorObj = node.findAllWithCriteria({
    types: [
      "VECTOR",
      "ELLIPSE",
      "POLYGON",
      "RECTANGLE",
      "STAR",
      "TEXT",
      "BOOLEAN_OPERATION",
    ],
  });
  console.log(vectorObj);
  vectorObj.forEach((vector) => {
    vectorToOutline(vector);
  });

  node.name = node.name.toLowerCase();
  const flatVector = figma.flatten(node.children);
  console.log(node.children);
  node.children[0].name = "ic";
  node.children[0].fillStyleId = bmAdminColor.id;
  flatVector.constraints = {
    horizontal: "SCALE",
    vertical: "SCALE",
  };
  node.resize(16, 16);
}

// create admin paint style
const bmAdminColor = ifAdminStyleExists()
  ? localStyle()
  : createPaintStyle("BM Admin Color", 0.99, 0.31372, 0);

let selection = figma.currentPage.selection;

// //! for one icon
function iconizeOne(node) {
  let icon = detachInstance(node[0]);

  iconCoreFix(icon);
}

function iconizeGroup(group) {
  for (const node of group) {
    const icon = detachInstance(node);
    iconCoreFix(icon);
  }
}

// function iconizeSheet(node) {
//   const icons = node[0].children;
//
//   icons.forEach((frame) => {
//     const icon = detachInstance(frame);
//     iconCoreFix(icon);
//   });
// }

function chooseIconizeType(node) {
  //! work on it
  if (node === []) {
    figma.notify("select something!!!!");
  }
  //!
  // if (node.type !== "FRAME" || node.type !== "INSTANCE") {
  //   return;
  // }
  if (node.length > 1) {
    console.log("group", node);
    iconizeGroup(node);
    return;
  }

  console.log("one", node);
  iconizeOne(node);
  return;
}

chooseIconizeType(selection);

figma.closePlugin();

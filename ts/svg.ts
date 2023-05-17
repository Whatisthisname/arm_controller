// type SvgInHtml = HTMLElement & SVGElement;

// function drawLine(p1 : v2, p2 : v2): SVGElement {
//     const svgNS = "http://www.w3.org/2000/svg";
  
//     const line = document.createElementNS(svgNS, "line");
//     line.setAttribute("x1", String(p1.x));
//     line.setAttribute("y1", String(p1.y));
//     line.setAttribute("x2", String(p2.x));
//     line.setAttribute("y2", String(p2.y));
//     line.setAttribute("stroke", "black");
  
//     return line;
//   }

// // Example usage
// const svgContainer = document.getElementById("svg_container") as SvgInHtml

// const lines : SVGElement[] = [];

// const endpoint = v2.zero();

// function draw() {

//     if (input.ArrowRight) {
//         endpoint.x += 2
//     }
//     if (input.ArrowLeft) {
//         endpoint.x -= 2
//     }
//     if (input.ArrowUp) {
//         endpoint.y += 2
//     }
//     if (input.ArrowDown) {
//         endpoint.y -= 2
//     }

//     const line = drawLine(endpoint, v2.zero());
//     svgContainer.appendChild(line);
//     lines.pop()?.remove();
//     lines.push(line);
//     window.requestAnimationFrame(draw);
// }

// window.requestAnimationFrame(draw);

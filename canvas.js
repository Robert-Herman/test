(function() {
     const template = document.createElement('template');
     const taskEvent = new CustomEvent("send-task", {
          bubbles: true,
          composed: true,
          detail: { selection: "empty" }
     });
     const groupEvent = new CustomEvent("send-group", {
          bubbles: true,
          composed: true,
          detail: { selection: "empty" }
     });
     template.innerHTML = `
          <style>
               :host {
                    display: block;
                    position: absolute;
                    left: 0%;
                    top: 0%;
                    height: 100%;
                    width: 100%;
               }
               #wrapper {
                    margin: 0 auto;
                    width: 100%;
                    height: 100%;
               }
               #todo-canvas {
                    height: 100%;
                    float: left;
               }
               #todo-ui {
                    position: relative;
                    float: right;
                    height: 100%;
                    margin: 0 auto;
                    border-radius: 10px;
                    width: 40%;
                    max-width: 400px;
                    min-width: 300px;
                    border: 1px solid red;
                    background-color: rgba(0,0,0,0.4);
               }
               button {
                    display: block;
                    margin: 10px auto;
                    width: 100px;
                    height: 30px;
                    border: 1px solid #000000;
                    border-radius: 5px;
               }
               .todo-block {
                    display: block;
                    //position: absolute;
                    width: 100%
                    height: 40%;
                    margin: 0 auto;
                    border: 2px solid black;
                    border-radius: 10px;
                    background-color: #fefefe;
               }
               #todo-groups {
                    margin-bottom: 4%;
               }
               #todo-tasks {
                    //display: none;
                    bottom: 0%;
               }
          </style>
          <div id="wrapper">
               <canvas id="todo-canvas"></canvas>
               <div id="todo-ui">
                    <div class="todo-block" id="todo-groups">
                         <button id="ui-addGroup">Add Group</button>
                         <select class="select-color" id="group-color" onchange="this.style.backgroundColor=this.options[this.selectedIndex].style.backgroundColor">
                              <option>Group Color</option>
                         </select>
                    </div>                    
                    <div class="todo-block" id="todo-tasks">
                         <button id="ui-addTask">Add Task</button>
                    </div>
               </div>
          </div>
     `;
     var canvas;
     var ctx;
     var elements = [];
     var selected = [];
     function Bubble() {
          this.color = "#00ff00";
          this.radius = 10;
          this.x = canvas.getBoundingClientRect().width/2;
          this.y = canvas.getBoundingClientRect().height/2;
          this.width = 200;
          this.height = 100;
          this.z = 0;
          this.arcRadius = 10;
          this.update = function() {
               let deltaW = this.width/2;
               let deltaH = this.height/2;
               ctx.beginPath();
               ctx.lineWidth = "5";
               ctx.strokeStyle = "#000000";
               ctx.moveTo(this.x+deltaW,this.y);
               ctx.lineTo(this.x+deltaW,this.y+deltaH-this.arcRadius);
               ctx.arc(this.x+deltaW-this.arcRadius,this.y+deltaH-this.arcRadius,this.arcRadius,0,0.5*Math.PI);
               ctx.lineTo(this.x-deltaW+this.arcRadius,this.y+deltaH);
               ctx.arc(this.x-deltaW+this.arcRadius,this.y+deltaH-this.arcRadius,this.arcRadius,0.5*Math.PI,Math.PI);
               ctx.lineTo(this.x-deltaW,this.y-deltaH+this.arcRadius);
               ctx.arc(this.x-deltaW+this.arcRadius,this.y-deltaH+this.arcRadius,this.arcRadius,Math.PI,1.5*Math.PI);
               ctx.lineTo(this.x+deltaW-this.arcRadius,this.y-deltaH);
               ctx.arc(this.x+deltaW-this.arcRadius,this.y-deltaH+this.arcRadius,this.arcRadius,1.5*Math.PI,2*Math.PI);
               ctx.lineTo(this.x+deltaW,this.y);
               ctx.fillStyle = this.color;
               ctx.fill();
               ctx.stroke();
               
          };
     }
     function animate() {
          //
     }
     animate();
     class GroupForm extends HTMLElement {
          static get observedAttributes() { 
               return ['data-groups','data-parents','data-tasks'];
          }
          constructor() {
               super();        
               this._init = this._init.bind(this);
               this._addElements = this._addElements.bind(this);
               this._checkMouse = this._checkMouse.bind(this);
               this.attachShadow({ mode: 'open' });
               this.shadowRoot.appendChild(template.content.cloneNode(true));
               this.addGroup = this.shadowRoot.querySelector("#ui-addGroup");
               //this.canvas = this.shadowRoot.querySelector("#todo-canvas");        
               //this.inputBtn = this.shadowRoot.querySelector("#btn-submit");
          }
          connectedCallback() {
               let self = this;
               this._init();
               this._addElements();   
               let colors = this.shadowRoot.querySelector(".select-color");
               for (let hsl=0; hsl<360; hsl=hsl+30) {
                    this._selectColor(hsl,colors);
               }         
               window.addEventListener("mousedown", function(event) {
                    event.preventDefault();
                    self._checkMouse(event);
                    self._animate();
               });
               window.addEventListener("mouseup", function(event) {
                    self._animate();
                    selected = [];
                    //window.onmousemove = null;                    
               });
               window.addEventListener("mousemove", e => {
                    if (selected.length > 0) {
                         let element = selected[selected.length-1];
                         ctx.fillStyle = "#ffffff";
                         ctx.fillRect(element.x-element.width/2-3,
                                        element.y-element.height/2-3,
                                        element.width+6,
                                        element.height+6);
                         element.x = element.x + e.movementX;
                         element.y = element.y + e.movementY;
                         element.update();
                    }
               });
               window.addEventListener("resize", this._init);
               this.addGroup.addEventListener("click",this._addElements);
          }
          disconnectedCallback() {
               //this.inputBtn.removeEventListener('click',this._updateInputs);
          }
          attributeChangedCallback(attrName, oldValue, newValue) {
               /*if(attrName === 'data-groups') {
               }
               else if(attrName === 'data-tasks') {
               }*/
          }
          _animate() {
               console.log("hi")
               elements.forEach(function(element) {
                    element.update();
               });
          }
          _init() {
               canvas = this.shadowRoot.querySelector("#todo-canvas");
               ctx = canvas.getContext("2d");
               var windowWidth = window.innerWidth - this.shadowRoot.querySelector("#todo-ui").offsetWidth - 20;
               var windowHeight = window.innerHeight;
               canvas.width = windowWidth;
               canvas.height = windowHeight;
               //canvas.getBoundingClientRect().left,top,width,height;
               ctx.lineWidth = "10";
               ctx.strokeRect(5,5,canvas.width-10,canvas.height-10);
          }
          _addElements() {
               let ball = new Bubble();
               ball.arcRadius = 20;
               ball.z = elements.length;
               elements.push(ball);
               //ball.update();
               this._animate();
          }
          _checkMouse(event) {
               let x = event.clientX;
               let y = event.clientY;
               selected = [];
               elements.forEach(function(element) {
                    if ((x < element.x+(element.width/2)) && (x > element.x-(element.width/2))) {
                         if ((y < element.y+(element.height/2)) && (y > element.y-(element.height/2))) {
                              /*element.color = "#808080";
                              window.onmousemove = function(e) {
                                   ctx.fillStyle = "#ffffff";
                                   ctx.fillRect(element.x-element.width/2-3,
                                                element.y-element.height/2-3,
                                                element.width+6,
                                                element.height+6);
                                   element.x = element.x + e.movementX;
                                   element.y = element.y + e.movementY;
                                   element.update();
                              }*/
                              selected.push(element);
                         }
                    }
               });
          }
          _sendGroups(jsonData) {
               groupEvent.detail.selection = jsonData;
               this.dispatchEvent(groupEvent);
          }
          _sendTasks(jsonData) {
               taskEvent.detail.selection = jsonData;
               this.dispatchEvent(taskEvent);
          }
          _addOptions(key_names,key_indent,key_hsl,options) {
               let option = document.createElement("option");
               option.setAttribute("class", "tree");
               option.setAttribute("node",key_names);
               option.innerText = key_names[key_names.length-1];
               option.style.marginLeft = key_indent;
               option.style.backgroundColor = "hsl("+key_hsl+",100%,50%)";
               options.appendChild(option);
          }
          _rgb2hue(colorVal) {
               colorVal = colorVal.replace(/[^\d,]/g, '').split(',');
               let r = colorVal[0]/255;
               let g = colorVal[1]/255;
               let b = colorVal[2]/255;
               let maxRGB = Math.max(r,g,b);
               let minRGB = Math.min(r,g,b);
               let indMax = [r,g,b].indexOf(maxRGB);
               let hue;
               switch (indMax) {
                    case 0:
                         hue = 60*(g-b)/(maxRGB-minRGB);
                         break;
                    case 1:
                         hue = 60*(2.0 + (b-r)/(maxRGB-minRGB));
                         break;
                    default:
                         hue = 60*(4.0 + (r-g)/(maxRGB-minRGB));
               }
               hue = hue < 0 ? hue + 360 : hue;
               return hue;
          }
          _selectColor(hsl,options) {
               let option = document.createElement("option");
               option.style.backgroundColor = "hsl("+hsl+",100%,50%)";
               options.appendChild(option);
          }
     }

    customElements.define('group-form', GroupForm);
})();

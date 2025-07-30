import"./modulepreload-polyfill-B5Qt9EMX.js";import{g as l,u as b}from"./updateCartValue-DpKbgD6o.js";import{s as I}from"./showToast-CumAmCrs.js";const E=()=>{document.getElementById("hamburger").addEventListener("click",function(e){e.stopPropagation(),document.getElementById("navbar-menu").classList.toggle("active")}),document.querySelectorAll(".nav-link").forEach(e=>{e.addEventListener("click",function(){document.getElementById("navbar-menu").classList.remove("active")})}),document.addEventListener("click",function(e){const t=document.getElementById("navbar-menu"),o=document.getElementById("hamburger");!t.contains(e.target)&&!o.contains(e.target)&&t.classList.remove("active")})},P=(e,t)=>{const r=l().find(d=>d.productId==e);let a=1;return r&&(a=r.quantity,t=r.price),{quantity:a,price:t}},f=()=>{const e=document.querySelector("#subtotal"),t=document.querySelector("#total"),o=document.querySelector("#tax"),r=document.querySelector("#discount"),n=l().reduce((p,c)=>{const u=Number.parseInt(c.price)||0;return p+u},0);e.textContent=`₹${n.toFixed(2)}`,o.textContent=`₹${(n*18/100).toFixed(2)}`,r.textContent=`-₹${(n*18/100).toFixed(2)}`,t.textContent=`₹${(n+n*18/100-n*18/100).toFixed(2)}`},x=e=>{let t=l();t=t.filter(r=>r.productId!=e),localStorage.setItem("cartProductLS",JSON.stringify(t));const o=document.getElementById(`card${String(e)}`);o&&(o.remove(),I("delete",e)),f(),b(t)},L=(e,t,o,r)=>{const a=l(),d=document.querySelector(`#card${t}`),n=d.querySelector(".quantity-input"),p=d.querySelector(".item-total");let c=1,u=r;const m=a.find(i=>i.productId==t);m&&(c=m.quantity||1,u=m.price/c),e.target.classList.contains("increase-btn")&&c<o&&(c+=1),e.target.classList.contains("decrease-btn")&&c>1&&(c-=1);const y=u*c;n.textContent=c,p.textContent=`₹${y.toFixed(2)}`;const g=a.map(i=>i.productId==t?{...i,quantity:c,price:y}:i);localStorage.setItem("cartProductLS",JSON.stringify(g)),f()},S=l();b(S);let h=[];const q="http://localhost:3001/api";async function w(){try{const t=await(await fetch(`${q}/products`)).json();if(t.success)return h=t.data,t.data;console.error("Failed to load products:",t.error)}catch(e){console.error("Error loading products:",e)}}async function A(){await w()}document.addEventListener("DOMContentLoaded",A);const B=h.filter(e=>S.some(t=>String(e.productId)==String(t.productId))),F=document.querySelector("#cart-item-template"),T=document.querySelector(".cart-items"),$=()=>{B.forEach(e=>{const{_id:t,productId:o,company:r,name:a,stock:d,price:n,wholesalePrice:p,mrp:c,description:u,imageUrl:m,imagePublicId:y,createdAt:g,updatedAt:i}=e,s=document.importNode(F.content,!0),v=P(o,n);s.querySelector(".item-title").textContent=a,s.querySelector(".item-specs").textContent=r,s.querySelector("#cardID").setAttribute("id",`card${o}`),s.querySelector(".item-price").textContent=`₹${n}`,s.querySelector(".item-total").textContent=`₹${v.price}`,s.querySelector(".item-image").src=m,s.querySelector(".quantity-input").textContent=v.quantity,s.querySelector(".remove-btn").addEventListener("click",()=>x(o)),s.querySelector(".quantity-controls").addEventListener("click",C=>{L(C,o,d,n)}),T.appendChild(s)})};function k(e){return Array.isArray(e)?e.map(t=>{if(t&&t.productId!==void 0){const o={...t,id:t.productId};return delete o.productId,o}return t}):(console.warn("renameProductIdToId expected an array, but received:",e),e)}async function N(e){e.preventDefault(),document.getElementById("info-overlay");const t=document.getElementById("name").value,o=document.getElementById("address").value,r=document.getElementById("phone").value,a={Name:t,Address:o,"Mobile Number":r,Type:"r",cart:k(l()),Status:"pending"};try{const n=await(await fetch(`${q}/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)})).json();n.success?console.log("Order added successfully:",n.message):console.error("Failed to add order:",n.error)}catch(d){console.error("Error:",d)}finally{console.log("Request completed")}localStorage.removeItem("cartProductLS"),closeModal()}const D=()=>{const e=`<div class="modal-overlay" id="modalOverlay">
        <div class="modal">
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <h2>Contact Information</h2>
            
            <form id="contactForm">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" >
                </div>

                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" placeholder="Enter your complete address"></textarea>
                </div>

                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="(123) 456-7890" >
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-submit">Continue</button>
                </div>
            </form>
        </div>
    </div>`,t=document.createElement("div");t.id="info-overlay",t.innerHTML=e,document.body.appendChild(t);const o=document.getElementById("contactForm");o&&o.addEventListener("submit",N)};window.closeModal=()=>{const e=document.getElementById("info-overlay");e.parentNode.removeChild(e)};const M=document.querySelector(".checkout-btn");M.addEventListener("click",D);f();$();E();

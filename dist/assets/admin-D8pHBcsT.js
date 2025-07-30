import"./modulepreload-polyfill-B5Qt9EMX.js";let j="dashboard",g=[],f=[],y=[{product:"",quantity:"",price:""}],C=[];const $="http://localhost:3001/api";function E(n,t){const r=document.getElementById("message-container");r&&(r.textContent=n,r.className=`message-container message-${t}`,r.style.display="block",t==="success"&&setTimeout(()=>{r.style.display="none"},5e3))}function tt(){const n=document.getElementById("message-container");n&&(n.style.display="none")}function v(n){const t=document.createElement("div");return t.textContent=n,t.innerHTML}function R(n){document.querySelectorAll(".nav-item").forEach(t=>{t.classList.remove("active")}),document.querySelector(`[data-tab="${n}"]`).classList.add("active"),document.querySelectorAll(".tab-content").forEach(t=>{t.classList.add("hidden")}),document.getElementById(`${n}-tab`).classList.remove("hidden"),j=n,P()}async function S(){try{const t=await(await fetch(`${$}/products`)).json();if(t.success)return g=t.data,P(),F(),t.data;console.error("Failed to load products:",t.error)}catch(n){console.error("Error loading products:",n)}}async function et(){const n=document.getElementById("product-id"),t=document.getElementById("product-image"),r=document.getElementById("product-company"),e=document.getElementById("product-item"),o=document.getElementById("product-stock"),s=document.getElementById("product-price"),i=document.getElementById("product-wh"),a=document.getElementById("product-mrp"),l=document.getElementById("product-description");if(!n.value||!r.value||!e.value||!o.value||!s.value||!t.files[0]){E("Please fill in all required fields (ID, Company, Name, Stock, Price, and Image)","error");return}const d=new FormData;d.append("productId",n.value),d.append("productImage",t.files[0]),d.append("productCompany",r.value),d.append("productItem",e.value),d.append("productStock",o.value),d.append("productPrice",s.value),d.append("productWh",i.value),d.append("productMrp",a.value),d.append("productDescription",l.value);const u=document.getElementById("add-product-btn");u.disabled=!0,u.textContent="Adding Product...",tt();try{const p=await(await fetch(`${$}/products`,{method:"POST",body:d})).json();p.success?(E(p.message,"success"),ot(),await S()):E(p.error,"error")}catch(m){console.error("Error:",m),E("Network error. Please check if the server is running.","error")}finally{u.disabled=!1,u.innerHTML=`
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
      Add Product
    `}}function ot(){document.getElementById("product-id").value="",document.getElementById("product-image").value="",document.getElementById("product-company").value="",document.getElementById("product-item").value="",document.getElementById("product-stock").value="",document.getElementById("product-price").value="",document.getElementById("product-wh").value="",document.getElementById("product-mrp").value="",document.getElementById("product-description").value=""}function H(){var e;const n=document.getElementById("products-table"),t=((e=document.getElementById("product-search"))==null?void 0:e.value.toLowerCase())||"",r=g.filter(o=>o.name.toLowerCase().includes(t)||o.company.toLowerCase().includes(t));n.innerHTML=r.map(o=>`
        <tr>
          <td><img src="${o.imageUrl}" alt="${o.name}" /></td>
          <td>${v(o.name)}</td>
          <td>${v(o.company)}</td>
          <td>₹${o.price.toFixed(2)}</td>
          <td>₹${o.wholesalePrice.toFixed(2)}</td>
          <td>
            <span class="badge ${o.stock<15?"badge-danger":"badge-success"}">
              ${o.stock}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="editProduct(${o.productId})">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${o.productId})">
              Delete
            </button>
          </td>
        </tr>
      `).join("")}function nt(){const n=document.getElementById("recent-products-table"),t=g.slice(0,5);n.innerHTML=t.map(r=>`
        <tr>
          <td>${v(r.name)}</td>
          <td>
            <span class="badge ${r.stock<15?"badge-danger":"badge-success"}">
              ${r.stock}
            </span>
          </td>
          <td>₹${r.price.toFixed(2)}</td>
        </tr>
      `).join("")}function U(){var e;const n=document.getElementById("stock-list"),t=((e=document.getElementById("stock-search"))==null?void 0:e.value.toLowerCase())||"",r=g.filter(o=>o.name.toLowerCase().includes(t)||o.company.toLowerCase().includes(t));n.innerHTML=r.map(o=>`
        <div class="stock-item">
          <div class="stock-info">
            <h4>${v(o.name)}</h4>
            <p>Current Stock: ${o.stock}</p>
            <p>Company: ${v(o.company)}</p>
          </div>
          <div class="stock-controls">
            <input type="number" class="stock-input" id="stock-${o.productId}" placeholder="New stock" min="0">
            <button class="btn btn-primary btn-sm" onclick="updateStock(${o.productId})">
              Update
            </button>
          </div>
        </div>
      `).join("")}async function rt(n){const t=Number.parseInt(document.getElementById(`stock-${n}`).value);if(isNaN(t)||t<0){alert("Please enter a valid stock quantity");return}try{const e=await(await fetch(`${$}/products/${n}/stock`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stock:t})})).json();e.success?(alert("Stock updated successfully!"),document.getElementById(`stock-${n}`).value="",await S()):alert("Failed to update stock: "+e.error)}catch(r){console.error("Error updating stock:",r),alert("Network error. Please check if the server is running.")}}function st(n,t){const r=document.getElementById(n);if(!r)return;const e=`
    <div class="searchable-dropdown" id="dropdown-${t}">
      <div class="dropdown-input-container">
        <input 
          type="text" 
          class="form-input dropdown-search" 
          placeholder="Search products..." 
          id="search-${t}"
          autocomplete="off"
        >
        <div class="dropdown-arrow">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
      </div>
      <div class="dropdown-options" id="options-${t}">
        <!-- Options will be populated here -->
      </div>
    </div>
  `;r.innerHTML=e;const o=document.getElementById(`search-${t}`);document.getElementById(`options-${t}`),M(t,""),o.addEventListener("input",s=>{M(t,s.target.value),D(t)}),o.addEventListener("focus",()=>{D(t)}),document.addEventListener("click",s=>{r.contains(s.target)||V(t)})}function M(n,t){const r=document.getElementById(`options-${n}`);if(!r)return;const e=g.filter(s=>{const i=t.toLowerCase();return s.name.toLowerCase().includes(i)||s.company.toLowerCase().includes(i)||s.productId.toString().includes(i)});if(e.length===0){r.innerHTML='<div class="dropdown-option no-results">No products found</div>';return}r.innerHTML=e.map(s=>`
      <div class="dropdown-option" data-product-id="${s.productId}" data-item-index="${n}">
        <div class="option-content">
          <div class="option-main">
            <span class="option-name">${v(s.name)}</span>
            <span class="option-price">₹${s.price.toFixed(2)}</span>
            <span class="option-wh-price">₹${s.wholesalePrice.toFixed(2)}</span>
          </div>
          <div class="option-details">
            <span class="option-company">${v(s.company)}</span>
            <span class="option-stock ${s.stock<15?"low-stock":""}">Stock: ${s.stock}</span>
          </div>
        </div>
      </div>
    `).join(""),r.querySelectorAll(".dropdown-option:not(.no-results)").forEach(s=>{s.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation();const a=Number.parseInt(s.getAttribute("data-product-id")),l=Number.parseInt(s.getAttribute("data-item-index")),d=g.find(u=>u.productId===a);d&&_(l,a,d.name,d.price)})})}function _(n,t,r,e){const o=document.getElementById(`search-${n}`);o&&(o.value=r),y[n].product=t,y[n].quantity&&J(n,"product",t),V(n),setTimeout(()=>{x()},100)}function D(n){const t=document.getElementById(`options-${n}`);t&&(t.style.display="block")}function V(n){const t=document.getElementById(`options-${n}`);t&&(t.style.display="none")}function T(){const n=document.getElementById("invoice-items");n.innerHTML=y.map((t,r)=>`
        <div class="invoice-item">
          <div id="product-dropdown-${r}"></div>
          <input type="number" placeholder="Quantity" class="form-input" 
                 value="${t.quantity}" onchange="updateInvoiceItem(${r}, 'quantity', this.value)" min="1">
          <input type="number" placeholder="Price" class="form-input" 
                 value="${t.price}" onchange="updateInvoiceItem(${r}, 'price', this.value)" step="0.01" readonly>
          <button class="btn btn-danger btn-sm" onclick="removeInvoiceItem(${r})">Remove</button>
        </div>
      `).join(""),y.forEach((t,r)=>{if(st(`product-dropdown-${r}`,r),t.product){const e=g.find(o=>o.productId==t.product);if(e){const o=document.getElementById(`search-${r}`);o&&(o.value=e.name)}}}),x()}function at(){y.push({product:"",quantity:"",price:""}),T()}function ct(n){y.splice(n,1),T()}function J(n,t,r){if(y[n][t]=r,t==="product"||t==="quantity"){const e=y[n].product,o=Number.parseInt(y[n].quantity)||0,s=g.find(i=>i.productId==e);if(s&&o>0){const a=document.querySelector('input[name="type"]:checked').value==="w"&&s.wholesalePrice||s.price;y[n].price=(a*o).toFixed(2)}else y[n].price="";x()}else x()}function x(){const n=y.reduce((t,r)=>t+Number.parseFloat(r.price||0),0);document.getElementById("invoice-total").textContent=n.toFixed(2)}async function dt(){const n=document.getElementById("customer-name").value,t=document.getElementById("customer-add").value,r=document.getElementById("customer-mno").value,e=Number.parseFloat(document.getElementById("invoice-total").textContent);if(!n||!t||!r||e<=0){alert("Please fill in all customer details and add items to the invoice.");return}const o=[],s=y.filter(i=>i.product&&i.quantity&&i.price);for(const i of s){const a=g.find(d=>d.productId==i.product),l=Number.parseInt(i.quantity);a&&a.stock<l&&o.push(`${a.name}: Only ${a.stock} items available, but ${l} requested`)}if(o.length>0){alert(`Insufficient stock for the following items:

`+o.join(`
`));return}try{const i=s.map(async d=>{const u=g.find(p=>p.productId==d.product),m=Number.parseInt(d.quantity);if(u){const p=u.stock-m,h=await(await fetch(`${$}/products/${u.productId}/stock`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stock:p})})).json();if(!h.success)throw new Error(`Failed to update stock for ${u.name}: ${h.error}`);return{productName:u.name,oldStock:u.stock,newStock:p,quantity:m}}}),a=await Promise.all(i);X(n,t,r,s,e),document.getElementById("customer-name").value="",document.getElementById("customer-add").value="",document.getElementById("customer-mno").value="",y=[{product:"",quantity:"",price:""}],T(),await S();const l=a.map(d=>`• ${d.productName}: ${d.oldStock} → ${d.newStock}`).join(`
`);alert(`Invoice generated successfully!

Stock levels updated:
${l}`)}catch(i){console.error("Error generating invoice:",i),alert(`Error generating invoice: ${i.message}

Please try again or check your connection.`)}}async function Q(){try{const t=await(await fetch(`${$}/orders`)).json();if(t.success)return f=t.data.sort((r,e)=>r.Status==="pending"&&e.Status!=="pending"?-1:r.Status!=="pending"&&e.Status==="pending"?1:0),console.log("Loaded seller requests:",f),P(),F(),t.data;console.error("Failed to load seller requests:",t.error),f=[]}catch(n){console.error("Error loading seller requests:",n),f=[]}}const z=document.getElementById("requests-search");z&&z.addEventListener("input",W);function W(){var e;const n=document.getElementById("requests-list"),t=((e=document.getElementById("requests-search"))==null?void 0:e.value.toLowerCase())||"";if(!f||f.length===0){n.innerHTML='<div class="request-item"><p>No seller requests found.</p></div>';return}const r=f.filter(o=>{const s=(o.Name||"").toLowerCase(),i=(o._id||"").toLowerCase(),a=(o.Address||"").toLowerCase(),l=(o["Mobile Number"]||"").toString().toLowerCase(),d=o.Type==="r"?"retail":o.Type==="w"?"wholesale":"unknown",u=(o.Status||"pending").toLowerCase();return s.includes(t)||i.includes(t)||a.includes(t)||l.includes(t)||d.includes(t)||u.includes(t)});if(r.length===0){n.innerHTML=`
      <div class="request-item">
        <p>No seller requests found matching "${t}".</p>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
          Try searching by customer name, order ID, address, mobile number, order type, or status.
        </p>
      </div>
    `;return}n.innerHTML=r.map(o=>{const s=Array.isArray(o.cart)?o.cart.length:0,i=Array.isArray(o.cart)?o.cart.reduce((a,l)=>a+l.price,0):0;return`
        <div class="request-item">
          <div class="request-header">
            <div class="request-info">
              <h4>${v(o.Name||"Unknown Customer")}</h4>
              <p><strong>Order Type:</strong> ${o.Type==="r"?"Retail":o.Type==="w"?"Wholesale":"Unknown"}</p>
              <p><strong>Address:</strong> ${v(o.Address||"N/A")}</p>
              <p><strong>Mobile:</strong> ${o["Mobile Number"]||"N/A"}</p>
              <p><strong>Items:</strong> ${s} products</p>
              <p><strong>Total Amount:</strong> ₹${i.toFixed(2)}</p>
              <p class="date"><strong>Order ID:</strong> ${o._id}</p>
            </div>
            <span class="badge ${o.Status==="pending"?"badge-warning":o.Status==="accepted"?"badge-success":"badge-danger"}">
              ${(o.Status||"pending").toUpperCase()}
            </span>
          </div>
          
          <div class="request-actions">
            ${o.Status==="pending"?`
                <button class="btn btn-success btn-sm" onclick="handleOrderRequest('${o._id}', 'accepted')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Accept
                </button>
                <button class="btn btn-danger btn-sm" onclick="handleOrderRequest('${o._id}', 'rejected')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Reject
                </button>
                <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${o._id}')">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  View Cart
                </button>
              `:o.Status==="accepted"?`
                  <button class="btn btn-primary btn-sm" onclick="downloadOrderRequest('${o._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                  </button>
                  <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${o._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    View Details
                  </button>
                `:`
                  <button class="btn btn-sm" style="background: #6b7280; color: white;" onclick="viewOrderDetails('${o._id}')">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    View Details
                  </button>
                `}
          </div>
        </div>
      `}).join("")}async function B(n,t){try{if(console.log(`Updating order ${n} to ${t}`),t==="accepted"){const o=f.find(a=>a._id==n);if(!o||!Array.isArray(o.cart)){alert("Order not found or invalid cart data");return}const s=[];for(const a of o.cart){const l=g.find(d=>d.productId==a.id);l&&l.stock<a.quantity?s.push(`${l.name}: Only ${l.stock} items available, but ${a.quantity} requested`):l||s.push(`Product with ID ${a.id} not found`)}if(s.length>0){alert(`Cannot accept order due to insufficient stock:

`+s.join(`
`));return}const i=o.cart.map(async a=>{const l=g.find(d=>d.productId==a.id);if(l){const d=l.stock-a.quantity,m=await(await fetch(`${$}/products/${l.productId}/stock`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stock:d})})).json();if(!m.success)throw new Error(`Failed to update stock for ${l.name}: ${m.error}`);return{productName:l.name,oldStock:l.stock,newStock:d,quantity:a.quantity}}});try{const a=await Promise.all(i),l=a.filter(d=>d).map(d=>`• ${d.productName}: ${d.oldStock} → ${d.newStock} (Sold: ${d.quantity})`).join(`
`);console.log("Stock updates completed:",a),await S(),alert(`Stock levels updated successfully:
${l}`)}catch(a){console.error("Error updating stock:",a),alert(`Error updating stock levels: ${a.message}

Order will not be accepted.`);return}}const e=await(await fetch(`${$}/orders/${n}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({Status:t,actionDate:new Date().toISOString()})})).json();e.success?(alert(`Order ${t} successfully!`),await Q(),F()):alert("Failed to update order: "+e.error)}catch(r){console.error("Error updating order:",r),alert("Network error. Please check if the server is running.")}}function G(n){const t=f.find(a=>a._id==n);if(!t){alert("Order not found");return}const r=Array.isArray(t.cart)?t.cart.reduce((a,l)=>a+l.price,0):0,e=Array.isArray(t.cart)&&t.cart.length>0?t.cart.map((a,l)=>{const d=g.find(m=>m.productId==a.id),u=a.quantity>0?(a.price/a.quantity).toFixed(2):"0.00";return`
            <tr>
              <td>${l+1}</td>
              <td>${a.id}</td>
              <td>${d?v(d.name):"Unknown Product"}</td>
              <td>${d?v(d.company):"N/A"}</td>
              <td>${a.quantity}</td>
              <td>₹${u}</td>
              <td>₹${a.price.toFixed(2)}</td>
            </tr>
          `}).join(""):'<tr><td colspan="8" style="text-align: center; color: #6b7280;">No items in cart</td></tr>',o=document.getElementById("request-modal");o&&o.remove();const s=`
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Order Details - ${t.Status==="pending"?"PENDING":t.Status==="accepted"?"ACCEPTED":"REJECTED"}</h3>
          <button class="modal-close" type="button">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Order ID:</strong>
              <span>${t._id}</span>
            </div>
            <div class="detail-item">
              <strong>Customer Name:</strong>
              <span>${v(t.Name||"N/A")}</span>
            </div>
            <div class="detail-item">
              <strong>Address:</strong>
              <span>${v(t.Address||"N/A")}</span>
            </div>
            <div class="detail-item">
              <strong>Mobile Number:</strong>
              <span>${t["Mobile Number"]||"N/A"}</span>
            </div>
            <div class="detail-item">
              <strong>Order Type:</strong>
              <span>${t.Type==="r"?"Retail":t.Type==="w"?"Wholesale":"Unknown"}</span>
            </div>
            <div class="detail-item">
              <strong>Status:</strong>
              <span class="badge ${t.Status==="pending"?"badge-warning":t.Status==="accepted"?"badge-success":"badge-danger"}">${(t.Status||"pending").toUpperCase()}</span>
            </div>
            <div class="detail-item">
              <strong>Total Items:</strong>
              <span>${Array.isArray(t.cart)?t.cart.length:0}</span>
            </div>
            <div class="detail-item">
              <strong>Total Amount:</strong>
              <span style="font-weight: bold; color: #059669;">₹${r.toFixed(2)}</span>
            </div>
            
            <div class="detail-item full-width">
              <strong>Cart Items:</strong>
              <div style="margin-top: 0.5rem; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">#</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Product ID</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Product Name</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Company</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Quantity</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Unit Price</th>
                      <th style="padding: 0.5rem; text-align: left; border: 1px solid #e5e7eb; font-weight: 600;">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${e}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          ${t.Status==="pending"?`
            <button class="btn btn-success" type="button" data-action="accept" data-order-id="${t._id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Accept Order
            </button>
            <button class="btn btn-danger" type="button" data-action="reject" data-order-id="${t._id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Reject Order
            </button>
          `:t.Status==="accepted"?`
            <button class="btn btn-primary" type="button" data-action="download" data-order-id="${t._id}">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download Order
            </button>
          `:""}
          <button class="btn" style="background: #6b7280; color: white;" type="button" data-action="close">Close</button>
        </div>
      </div>
    </div>
  `,i=document.createElement("div");i.id="request-modal",i.innerHTML=s,document.body.appendChild(i),setTimeout(()=>{const a=document.getElementById("request-modal");if(!a)return;const l=a.querySelector(".modal-overlay");l&&l.addEventListener("click",c=>{c.target===l&&I()});const d=a.querySelector(".modal-close");d&&d.addEventListener("click",I),a.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",h=>{const b=h.target.closest("[data-action]").getAttribute("data-action"),k=h.target.closest("[data-action]").getAttribute("data-order-id");switch(b){case"accept":B(k,"accepted"),I();break;case"reject":B(k,"rejected"),I();break;case"download":N(k),I();break;case"close":I();break}})});const m=a.querySelector(".modal-content");m&&m.addEventListener("click",c=>{c.stopPropagation()});const p=c=>{c.key==="Escape"&&(I(),document.removeEventListener("keydown",p))};document.addEventListener("keydown",p),a.style.opacity="0",a.style.display="flex",setTimeout(()=>{a.style.opacity="1"},10)},10)}function I(){const n=document.getElementById("request-modal");n&&(n.style.opacity="0",setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},200))}function N(n){const t=f.find(o=>o._id==n);if(!t){alert("Order not found");return}const r=Array.isArray(t.cart)?t.cart.reduce((o,s)=>o+s.price,0):0,e=Array.isArray(t.cart)&&t.cart.length>0?t.cart.map(o=>{const s=g.find(a=>a.productId==o.id),i=o.quantity>0?parseFloat((o.price/o.quantity).toFixed(2)):0;return{product:Number(o.id),productName:(s==null?void 0:s.name)||"Unknown Product",quantity:o.quantity,price:i,totalPrice:o.price}}):[];X(t.Name,t.Address||"N/A",String(t["Mobile Number"])||"N/A",e,r),alert("Order document downloaded successfully!")}function it(){const n=document.getElementById("offer-image"),t=document.getElementById("offer-description"),r=n.files[0],e=t.value.trim();if(!r||!e){alert("Please upload an image and add a description.");return}const o=new FileReader;o.onload=s=>{const i={id:Date.now(),imageUrl:s.target.result,description:e,createdAt:new Date().toISOString()};C.push(i),A(),n.value="",t.value=""},o.readAsDataURL(r)}function A(){const n=document.getElementById("offers-table");n.innerHTML=C.map(t=>`
      <tr>
        <td><img src="${t.imageUrl}" alt="Offer" style="width: 100px; height: auto; border-radius: 5px;"></td>
        <td>${v(t.description)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="removeOffer(${t.id})">
            Remove
          </button>
        </td>
      </tr>
    `).join("")}function lt(n){C=C.filter(t=>t.id!==n),A()}function F(){document.getElementById("total-products").textContent=g.length,document.getElementById("pending-requests").textContent=f.filter(t=>t.Status==="pending").length,document.getElementById("low-stock-items").textContent=g.filter(t=>t.stock<15).length;const n=f.filter(t=>t.Status==="accepted"&&t.cart).reduce((t,r)=>{const e=r.cart.reduce((o,s)=>o+s.price,0);return t+e},0);document.getElementById("total-revenue").textContent=`₹${n.toFixed(2)}`}function P(){switch(j){case"dashboard":nt();break;case"products":H();break;case"stock":U();break;case"invoice":T();break;case"requests":W();break;case"offer":A();break}}document.addEventListener("DOMContentLoaded",async()=>{document.querySelectorAll(".nav-item").forEach(o=>{o.addEventListener("click",()=>{const s=o.getAttribute("data-tab");R(s)})});const n=document.getElementById("add-product-btn");n&&n.addEventListener("click",et);const t=document.getElementById("product-search");t&&t.addEventListener("input",H);const r=document.getElementById("stock-search");r&&r.addEventListener("input",U);const e=document.getElementById("product-image");e&&e.addEventListener("change",o=>{const s=o.target.files[0];if(s){if(s.size>5*1024*1024){E("File size should be less than 5MB","error"),e.value="";return}if(!s.type.startsWith("image/")){E("Please select a valid image file","error"),e.value="";return}}}),await S(),await Q(),F(),P()});window.viewOrderDetails=G;window.handleOrderRequest=B;window.downloadOrderRequest=N;window.selectProduct=_;window.viewRequestDetails=G;window.handleRequest=B;window.downloadRequest=N;window.switchTab=R;window.addInvoiceItem=at;window.removeInvoiceItem=ct;window.updateInvoiceItem=J;window.generateInvoice=dt;window.updateStock=rt;window.addOffer=it;window.removeOffer=lt;window.editProduct=n=>alert(`Edit product ${n} - Feature coming soon!`);window.deleteProduct=n=>alert(`Delete product ${n} - Feature coming soon!`);function ut(n,t){const{jsPDF:r}=window.jspdf,e=new r;if(!n||!n.company||!n.invoice||!n.client||!n.items)throw new Error("Missing required invoice data. Please provide company, invoice, client, and items information.");const o=n.company,s=n.invoice,i=n.client,a=n.items||[],l=n.taxRate||0,d=n.notes||"",u=[235,228,221],m=[51,51,51],p=[248,249,250];e.setFillColor(u[0],u[1],u[2]),e.rect(0,0,210,32,"F"),e.setTextColor(0,0,0),e.setFontSize(18),e.setFont("helvetica","bold"),e.text(o.name,15,12),e.setFontSize(10),e.setFont("helvetica","normal");let c=16;e.text(o.address,15,c),o.phone&&(c+=6,e.text(`Phone: ${o.phone}`,15,c)),o.email&&(c+=6,e.text(`Email: ${o.email}`,15,c)),e.setTextColor(0,0,0),e.setFontSize(15),e.setFont("helvetica","bold"),e.text("INVOICE",140,12),e.setFontSize(9),e.setFont("helvetica","normal"),e.text(s.number,140,15),e.setTextColor(m[0],m[1],m[2]),c=40,e.setFillColor(p[0],p[1],p[2]),e.rect(15,c-5,85,25,"F"),e.setFontSize(12),e.setFont("helvetica","bold"),e.text("Bill To:",18,c+3),e.setFontSize(9.5),e.setFont("helvetica","normal"),e.text(i.name,18,c+7),e.text(i.address,18,c+10),i.city&&e.text(i.city,18,c+13),i.email&&e.text(i.email,18,c+16),e.setFillColor(p[0],p[1],p[2]),e.rect(110,c-5,85,25,"F"),e.setFontSize(12),e.setFont("helvetica","bold"),e.text("Invoice Details:",115,c+3),e.setFontSize(9.5),e.setFont("helvetica","normal"),e.text(`Date: ${s.date}`,115,c+7),e.text(`Due Date: ${s.dueDate}`,115,c+11),e.text(`Terms: ${s.paymentTerms}`,115,c+14),c=60,e.setFillColor(u[0],u[1],u[2]),e.rect(15,c,180,9,"F"),e.setTextColor(0,0,0),e.setFontSize(9),e.setFont("helvetica","bold"),e.text("Description",20,c+5),e.text("Qty",120,c+5),e.text("Rate",140,c+5),e.text("Amount",170,c+5),c+=9,e.setTextColor(m[0],m[1],m[2]),e.setFont("helvetica","normal");let h=0;a.forEach((w,Z)=>{const O=Number(w.quantity)*Number(w.price);h+=O,Z%2===0&&(e.setFillColor(p[0],p[1],p[2]),e.rect(15,c,180,10,"F")),c+=5;const L=g.find(Y=>Y.productId===w.product);console.log("Product found:",L);const K=e.splitTextToSize(L.company+" "+L.name,95);e.text(K[0],20,c),e.text(w.quantity.toString(),120,c),e.text(`${Number(w.price).toFixed(2)}`,140,c),e.text(`${O.toFixed(2)}`,170,c),c+=2}),c+=15;const b=130;e.setFillColor(p[0],p[1],p[2]),e.rect(b-5,c-5,70,30,"F"),e.setFont("helvetica","normal"),e.setFontSize(11),e.text("Subtotal:",b,c+5),e.text(`${h.toFixed(2)}`,b+45,c+5);const k=h*(l/100);if(c+=8,e.text(`Tax (${l}%):`,b,c+5),e.text(`${k.toFixed(2)}`,b+45,c+5),c+=8,e.setFont("helvetica","bold"),e.setFontSize(13),e.text("Total:",b,c+5),e.text(`${h.toFixed(2)}`,b+45,c+5),d){c+=25,e.setFontSize(12),e.setFont("helvetica","bold"),e.text("Notes:",15,c),c+=8,e.setFontSize(10),e.setFont("helvetica","normal");const w=e.splitTextToSize(d,170);e.text(w,15,c)}const q=`Invoice_${s.number.replace(/[^a-zA-Z0-9]/g,"_")}.pdf`;return e.save(q),{success:!0,fileName:q,subtotal:h,tax:k,total:t}}function X(n,t,r,e,o){const s=new Date;let i=(Math.random()*1e4).toFixed(0);const a=s.toISOString().split("T")[0],l={company:{name:"Gupta Electronics",address:"Pani Tanki, Dehri-on-sone,Bihar",phone:"(555) 123-4567",email:"info@techcorp.com"},invoice:{number:"INV-2025-"+i,date:a,dueDate:a,paymentTerms:"By Cash"},client:{name:n,address:t,city:r,email:"xyz@gmail.com"},items:e,taxRate:18,notes:"Thank you for choosing Gupta Electronics! This invoice is generated for demonstration purposes only."};document.getElementById("sampleData").textContent=JSON.stringify(l,null,2),ut(l,o)}

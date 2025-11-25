const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateFormCard = document.querySelector('.update-mode'); // Card de Edição
const addFormCard = document.querySelector('.add-mode'); // Card de Adição
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductPrice = document.querySelector('#update-price');
const cancelUpdateButton = document.querySelector('#cancel-update');

// 🚨 ATENÇÃO: Use o seu IP real
const API_BASE_URL = 'http://18.217.155.122:3000/products'; 

// --- GESTÃO DA INTERFACE (UX) ---

function showUpdateForm() {
    updateFormCard.style.display = 'block';
    addFormCard.style.display = 'none';
}

function showAddForm() {
    updateProductForm.reset();
    updateFormCard.style.display = 'none';
    addFormCard.style.display = 'block';
}

// Inicializa mostrando apenas o formulário de adição
showAddForm();


// --- RENDERIZAÇÃO E FETCH ---

async function fetchProducts() {
    try {
        const response = await fetch(API_BASE_URL);
        
        // Verifica se a resposta foi bem-sucedida (status 200-299)
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        // Limpa e Renderiza
        productList.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            li.className = 'product-item';
            
            const productInfo = document.createElement('span');
            productInfo.textContent = `${product.name} - R$${parseFloat(product.price).toFixed(2)}`;
            li.appendChild(productInfo);
            
            // Botão DELETE
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '🗑️ Deletar';
            deleteButton.className = 'btn btn-danger btn-small';
            deleteButton.addEventListener('click', () => deleteProduct(product.id));
            li.appendChild(deleteButton);

            // Botão UPDATE (Preenche o formulário)
            const updateButton = document.createElement('button');
            updateButton.innerHTML = '✏️ Editar';
            updateButton.className = 'btn btn-primary btn-small';
            updateButton.addEventListener('click', () => {
                updateProductId.value = product.id;
                updateProductName.value = product.name;
                updateProductPrice.value = product.price;
                showUpdateForm(); // Exibe o formulário de edição
            });
            li.appendChild(updateButton);

            productList.appendChild(li);
        });
        
    } catch (error) {
        console.error('Falha na comunicação com a API:', error);
        productList.innerHTML = `<li style="color: red;">❌ Erro ao carregar produtos. Verifique o Back-end e o IP: ${API_BASE_URL}</li>`;
    }
}


// --- ROTAS (CREATE) ---

addProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = addProductForm.elements['name'].value;
    const price = parseFloat(addProductForm.elements['price'].value);
    
    // Incluir validação básica
    if (name && !isNaN(price)) {
        await addProduct(name, price);
        addProductForm.reset();
        await fetchProducts();
    }
});

async function addProduct(name, price) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });
        
        if (!response.ok) {
            throw new Error(`Falha ao adicionar: ${response.statusText}`);
        }
        return response.json();
        
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto. Consulte o console.');
    }
}


// --- ROTAS (UPDATE) ---

// Listener para o formulário de edição
updateProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = updateProductId.value;
    const name = updateProductName.value;
    const price = parseFloat(updateProductPrice.value);
    
    if (id && name && !isNaN(price)) {
        await updateProduct(id, name, price);
        showAddForm(); // Volta para o formulário de adição
        await fetchProducts();
    }
});

// Listener para o botão CANCELAR
cancelUpdateButton.addEventListener('click', showAddForm);

async function updateProduct(id, name, price) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT', // PUT é ideal para atualização completa
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });

        if (!response.ok) {
            throw new Error(`Falha ao atualizar: ${response.statusText}`);
        }
        return response.json();
        
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar produto. Consulte o console.');
    }
}


// --- ROTAS (DELETE) ---

async function deleteProduct(id) {
    if (!confirm(`Tem certeza que deseja deletar o produto ID ${id}?`)) {
        return; // Cancela a operação
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Falha ao deletar: ${response.statusText}`);
        }
        
        // Se a exclusão foi bem-sucedida, atualiza a lista
        await fetchProducts();
        
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Consulte o console.');
    }
}

// Inicia o carregamento da lista
fetchProducts();
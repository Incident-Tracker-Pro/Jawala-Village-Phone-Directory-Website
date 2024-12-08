document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const categoryGrid = document.getElementById('categoryGrid');
    const selectedCategoryName = document.getElementById('selectedCategoryName');
    let businessData = null;
    let selectedCategory = null;

    // Enhanced error handling for fetch
    async function fetchBusinessData() {
        try {
            const response = await fetch('./businesses.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            businessData = await response.json();

            renderCategoryGrid(businessData.categories);
            renderBusinesses(businessData.businesses);
        } catch (error) {
            console.error('Error fetching business data:', error);
            businessList.innerHTML = `
                <div class="no-results error">
                    <p>डेटा लोड करण्यात त्रुटी आली: ${error.message}</p>
                    <button onclick="window.location.reload()">पुन्हा प्रयत्न करा</button>
                </div>`;
        }
    }

    // Performance optimization for rendering
    function createElementWithClass(tag, className) {
        const element = document.createElement(tag);
        element.className = className;
        return element;
    }

    function renderCategoryGrid(categories) {
        categoryGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // Add "All Categories" option first
        const allCategoriesItem = createAllCategoriesElement();
        fragment.appendChild(allCategoriesItem);

        categories.forEach(category => {
            const categoryItem = createCategoryElement(category);
            fragment.appendChild(categoryItem);
        });

        categoryGrid.appendChild(fragment);
    }

    function createAllCategoriesElement() {
        const allCategoriesItem = createElementWithClass('div', 'category-item');
        allCategoriesItem.innerHTML = `
            <i class="fas fa-th-large"></i>
            <span>सर्व श्रेण्या</span>
        `;
        
        allCategoriesItem.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => 
                item.classList.remove('selected')
            );
            
            allCategoriesItem.classList.add('selected');
            selectedCategory = null;
            selectedCategoryName.textContent = '';
            selectedCategoryName.style.opacity = '0';
            
            filterBusinesses();
        });

        return allCategoriesItem;
    }

    function createCategoryElement(category) {
        const categoryItem = createElementWithClass('div', 'category-item');
        categoryItem.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        `;
        
        categoryItem.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => 
                item.classList.remove('selected')
            );
            
            categoryItem.classList.add('selected');
            selectedCategory = category.id;
            
            selectedCategoryName.textContent = category.name;
            selectedCategoryName.style.opacity = '1';
            
            filterBusinesses();
        });

        return categoryItem;
    }

    function filterBusinesses() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        const filteredBusinesses = businessData.businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm || 
                Object.values(business).some(value =>
                    value.toString().toLowerCase().includes(searchTerm)
                );
            return matchesCategory && matchesSearch;
        });

        renderBusinesses(filteredBusinesses);
    }

    function renderBusinesses(businesses) {
        businessList.innerHTML = ''; 

        if (businesses.length === 0) {
            businessList.innerHTML = `
                <div class="no-results">
                    <p>कोणतेही व्यवसाय सापडले नाहीत.</p>
                </div>`;
            return;
        }

        const groupedBusinesses = groupBusinessesByCategory(businesses);

        Object.entries(groupedBusinesses).forEach(([categoryId, categoryBusinesses]) => {
            const category = businessData.categories.find(cat => cat.id === categoryId);
            
            const categoryHeader = createElementWithClass('div', 'category-header');
            categoryHeader.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
            businessList.appendChild(categoryHeader);

            categoryBusinesses.forEach(business => {
                const businessCard = createBusinessCard(business);
                businessList.appendChild(businessCard);
            });
        });
    }

    function groupBusinessesByCategory(businesses) {
        return businesses.reduce((acc, business) => {
            if (!acc[business.category]) acc[business.category] = [];
            acc[business.category].push(business);
            return acc;
        }, {});
    }

    function createBusinessCard(business) {
        const businessCard = createElementWithClass('div', 'business-card');
        businessCard.innerHTML = `
            <h4>${business.shopName}</h4>
            <p><strong>मालक:</strong> ${business.ownerName}</p>
            <p><strong>संपर्क:</strong> <a href="tel:${business.contactNumber}">${formatPhoneNumber(business.contactNumber)}</a></p>
        `;
        return businessCard;
    }

    function formatPhoneNumber(phoneNumber) {
        return phoneNumber.length === 10 
            ? `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`
            : phoneNumber;
    }

    // Debounce search input to improve performance
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        };
    }

    searchInput.addEventListener('input', debounce(filterBusinesses, 300));

    fetchBusinessData();
});

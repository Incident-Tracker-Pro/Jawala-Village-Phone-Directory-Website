document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const categoryGrid = document.getElementById('categoryGrid');
    const selectedCategoryName = document.getElementById('selectedCategoryName');
    let businessData = null;
    let selectedCategory = null;

    // Fetch business data
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
                <div class="no-results">
                    <p>डेटा लोड करण्यात त्रुटी आली: ${error.message}</p>
                </div>`;
        }
    }

    // Render category grid
    function renderCategoryGrid(categories) {
        categoryGrid.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.classList.add('category-item');
            categoryItem.innerHTML = `
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            `;
            
            categoryItem.addEventListener('click', () => {
                // Remove selected class from all items
                document.querySelectorAll('.category-item').forEach(item => 
                    item.classList.remove('selected')
                );
                
                // Add selected class to clicked item
                categoryItem.classList.add('selected');
                
                // Update selected category
                selectedCategory = category.id;
                
                // Update category name display
                selectedCategoryName.textContent = category.name;
                selectedCategoryName.style.opacity = '1';
                
                // Filter and render businesses
                filterBusinesses();
            });
            
            categoryGrid.appendChild(categoryItem);
        });

        // Add "All Categories" option
        const allCategoriesItem = document.createElement('div');
        allCategoriesItem.classList.add('category-item');
        allCategoriesItem.innerHTML = `
            <i class="fas fa-th-large"></i>
            <span>सर्व श्रेण्या</span>
        `;
        
        allCategoriesItem.addEventListener('click', () => {
            // Remove selected class from all items
            document.querySelectorAll('.category-item').forEach(item => 
                item.classList.remove('selected')
            );
            
            // Add selected class to all categories item
            allCategoriesItem.classList.add('selected');
            
            // Clear selected category
            selectedCategory = null;
            
            // Clear category name display
            selectedCategoryName.textContent = '';
            selectedCategoryName.style.opacity = '0';
            
            // Filter and render businesses
            filterBusinesses();
        });
        
        categoryGrid.appendChild(allCategoriesItem);
    }

    // Filter and render businesses
    function filterBusinesses() {
        const searchTerm = searchInput.value.trim();
        
        // Filter businesses
        const filteredBusinesses = businessData.businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm ||
                Object.values(business).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            return matchesCategory && matchesSearch;
        });

        // Render filtered businesses
        renderBusinesses(filteredBusinesses);
    }

    // Render businesses
    function renderBusinesses(businesses) {
        businessList.innerHTML = ''; // Clear previous content

        if (businesses.length === 0) {
            businessList.innerHTML = '<div class="no-results"><p>कोणतेही व्यवसाय सापडले नाहीत.</p></div>';
            return;
        }

        // Group businesses by category
        const groupedBusinesses = businesses.reduce((acc, business) => {
            if (!acc[business.category]) acc[business.category] = [];
            acc[business.category].push(business);
            return acc;
        }, {});

        // Render businesses grouped by category
        for (const categoryId in groupedBusinesses) {
            const category = businessData.categories.find(cat => cat.id === categoryId);
            
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
            businessList.appendChild(categoryHeader);

            // Business cards for this category
            groupedBusinesses[categoryId].forEach(business => {
                const businessCard = document.createElement('div');
                businessCard.classList.add('business-card');
                businessCard.innerHTML = `
                    <h4>${business.shopName}</h4>
                    <p><strong>मालक:</strong> ${business.ownerName}</p>
                    <p><strong>संपर्क:</strong> <a href="tel:${business.contactNumber}">${formatPhoneNumber(business.contactNumber)}</a></p>
                `;
                businessList.appendChild(businessCard);
            });
        }
    }

    // Format phone number for better readability
    function formatPhoneNumber(phoneNumber) {
        if (phoneNumber.length === 10) {
            return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`;
        }
        return phoneNumber;
    }

    // Handle search input
    searchInput.addEventListener('input', filterBusinesses);

    // Initialize app
    fetchBusinessData();
});

document.addEventListener('DOMContentLoaded', () => {
    const businessList = document.getElementById('businessList');
    const searchInput = document.getElementById('searchInput');
    const categoryDropdown = document.getElementById('categoryDropdown');
    let businessData = null;

    // Fetch business data
    async function fetchBusinessData() {
        try {
            const response = await fetch('./businesses.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            businessData = await response.json();

            populateCategories(businessData.categories);
            renderBusinesses(businessData.businesses);
        } catch (error) {
            console.error('Error fetching business data:', error);
            businessList.innerHTML = `
                <div class="error-message">
                    <p>डेटा लोड करण्यात त्रुटी आली: ${error.message}</p>
                </div>`;
        }
    }

    // Populate category dropdown
    function populateCategories(categories) {
        categoryDropdown.innerHTML = '<option value="">सर्व श्रेण्या</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryDropdown.appendChild(option);
        });
    }

    // Render businesses
    function renderBusinesses(businesses, selectedCategory = null, searchTerm = null) {
        businessList.innerHTML = ''; // Clear previous content

        // Filter businesses
        const filteredBusinesses = businesses.filter(business => {
            const matchesCategory = !selectedCategory || business.category === selectedCategory;
            const matchesSearch = !searchTerm ||
                Object.values(business).some(value =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            return matchesCategory && matchesSearch;
        });

        if (filteredBusinesses.length === 0) {
            businessList.innerHTML = '<div class="no-results"><p>कोणतेही व्यवसाय सापडले नाहीत.</p></div>';
            return;
        }

        // Group businesses by category
        const groupedBusinesses = filteredBusinesses.reduce((acc, business) => {
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

    // Handle search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        const selectedCategory = categoryDropdown.value || null;
        renderBusinesses(businessData.businesses, selectedCategory, searchTerm);
    });

    // Handle category selection
    categoryDropdown.addEventListener('change', (e) => {
        const selectedCategory = e.target.value || null;
        const searchTerm = searchInput.value.trim();
        renderBusinesses(businessData.businesses, selectedCategory, searchTerm);
    });

    // Initialize app
    fetchBusinessData();
});

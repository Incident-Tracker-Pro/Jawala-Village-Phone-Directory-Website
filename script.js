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
                <p style="color: red; text-align: center;">
                    डेटा लोड करण्यात त्रुटी आली: ${error.message}
                </p>`;
        }
    }

    // Populate category dropdown
    function populateCategories(categories) {
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
            businessList.innerHTML = '<p>कोणतेही व्यवसाय सापडले नाहीत.</p>';
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
            const categoryHeader = document.createElement('h3');
            categoryHeader.classList.add('category-header');
            categoryHeader.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;
            businessList.appendChild(categoryHeader);

            groupedBusinesses[categoryId].forEach(business => {
                const businessCard = document.createElement('div');
                businessCard.classList.add('business-card');
                businessCard.innerHTML = `
                    <h4>${business.shopName}</h4>
                    <p>मालक: ${business.ownerName}</p>
                    <p>संपर्क: <a href="tel:${business.contactNumber}">${business.contactNumber}</a></p>
                `;
                businessList.appendChild(businessCard);
            });
        }
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

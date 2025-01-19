document.addEventListener('DOMContentLoaded', () => {
    const DATA_DIRECTORY = 'data/';
    const dropdowns = {
        region: document.getElementById('region'),
        province: document.getElementById('province'),
        city: document.getElementById('city'),
        barangay: document.getElementById('barangay')
    };

    // Load JSON data asynchronously
    const loadJSONData = async () => {
        const files = ['regions.json', 'provinces.json', 'cities.json', 'barangays.json'];
        const dataPromises = files.map(file => fetch(`${DATA_DIRECTORY}${file}`).then(res => res.json()));
        const [regions, provinces, cities, barangays] = await Promise.all(dataPromises);

        // Return sorted data for efficient filtering
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        return {
            regions,
            provinces: provinces.sort((a, b) => collator.compare(a.prov_name, b.prov_name)),
            cities: cities.sort((a, b) => collator.compare(a.city_name, b.city_name)),
            barangays: barangays.sort((a, b) => collator.compare(a.brgy_name, b.brgy_name))
        };
    };

    // Populate dropdown with options
    const populateDropdown = (dropdown, items, valueField, textField, defaultText) => {
        dropdown.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        items.forEach(item => {
            dropdown.insertAdjacentHTML(
                'beforeend',
                `<option value="${item[valueField]}">${item[textField]}</option>`
            );
        });
        dropdown.disabled = false;
    };

    // Reset dependent dropdowns
    const resetDependentDropdowns = (dropdownKeys) => {
        dropdownKeys.forEach(key => {
            const dropdown = dropdowns[key];
            dropdown.disabled = true;
        });
    };

    // Initialize cascading dropdowns
    const initDropdowns = (data) => {
        const { regions, provinces, cities, barangays } = data;

        populateDropdown(dropdowns.region, regions, 'reg_code', 'reg_name', 'Select a region');

        dropdowns.region.addEventListener('change', () => {
            resetDependentDropdowns(['province', 'city', 'barangay']);
            const filteredProvinces = provinces.filter(prov => prov.reg_code === dropdowns.region.value);
            populateDropdown(dropdowns.province, filteredProvinces, 'prov_code', 'prov_name', 'Select a province');
        });

        dropdowns.province.addEventListener('change', () => {
            resetDependentDropdowns(['city', 'barangay']);
            const filteredCities = cities.filter(city => city.prov_code === dropdowns.province.value);
            populateDropdown(dropdowns.city, filteredCities, 'city_code', 'city_name', 'Select a city');
        });

        dropdowns.city.addEventListener('change', () => {
            resetDependentDropdowns(['barangay']);
            const filteredBarangays = barangays.filter(brgy => brgy.city_code === dropdowns.city.value);
            populateDropdown(dropdowns.barangay, filteredBarangays, 'brgy_code', 'brgy_name', 'Select a barangay');
        });
    };

    // Fetch data and initialize dropdowns
    loadJSONData().then(data => initDropdowns(data));
});

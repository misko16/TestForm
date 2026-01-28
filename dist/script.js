document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ЛОГІКА ДАТИ (Flatpickr) ---
    const dateField = document.getElementById('flatpickr-date');
    if (dateField) {
        flatpickr("#flatpickr-date", {
            dateFormat: "Y-m-d",
            disableMobile: true,
            defaultDate: "today",
            animate: true,
            allowInput: false
        });
    }

    // --- 2. ГЕНЕРАЦІЯ ТАБЛИЦІ ---
    const items = [
        "Bottom Weather Strip", "Top & Bottom Fixtures", "Hinges & Side Lock", 
        "Rollers", "Tracks", "Back Hanging Angles", "Jambs", "Shaft", 
        "Springs", "Spring Cones", "Bearing Plates", "Bearings", 
        "Cables", "Cable Drums", "Door Sections", "Windows", 
        "Exterior Weather Strip", "Pull Cord", "Step Plates, Pull Handles", "Slide Locks"
    ];

    const tbody = document.getElementById('table-body');
    if (tbody) {
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="col-inspect">${item}</td>
                <td class="col-status">
                    <select class="status-select" onchange="this.style.color = (this.value === 'fail' ? 'red' : (this.value === 'pass' ? 'green' : 'black'))">
                        <option value=""></option>
                        <option value="pass">✓</option>
                        <option value="fail">X</option>
                    </select>
                </td>
                <td class="col-comments">
                    <textarea class="auto-grow" rows="1"></textarea>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

// --- 3. ЛОГІКА ДРУКУ ТА ОЧИЩЕННЯ (БЕЗ RELOAD) ---
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    window.onafterprint = () => {
        setTimeout(() => {
            if (confirm("Reset form for the next customer?")) {
                // 1. Очищаємо всі текстові поля та textarea
                document.querySelectorAll('input, textarea').forEach(el => {
                    // Не чіпаємо дату, якщо хочемо залишити її на сьогодні
                    if (el.id !== 'flatpickr-date') {
                        el.value = '';
                    }
                });

                // 2. Скидаємо всі випадаючі списки (селекти)
                document.querySelectorAll('select').forEach(sel => {
                    sel.selectedIndex = 0;
                    sel.style.color = 'black'; // Повертаємо колір тексту
                });

                // 3. Скидаємо календар на сьогодні
                const fp = document.getElementById('flatpickr-date')._flatpickr;
                if (fp) {
                    fp.setDate(new Date());
                }

                // 4. Скидаємо висоту всіх textarea, що розтягнулися
                document.querySelectorAll('textarea.auto-grow').forEach(txt => {
                    txt.style.height = 'auto';
                });

                alert("Form cleared!");
            }
        }, 300);
    };
    // --- 4. АВТОЗАПОВНЕННЯ АДРЕС (Photon API) ---
    const addressInput = document.getElementById('address-input');
    const resultsContainer = document.getElementById('address-results');

    if (addressInput && resultsContainer) {
        addressInput.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length < 1) {
                resultsContainer.innerHTML = '';
                resultsContainer.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`);
                const data = await response.json();
                resultsContainer.innerHTML = '';
                
                if (data.features.length > 0) {
                    resultsContainer.style.display = 'block';
                    data.features.forEach(feature => {
                        const p = feature.properties;
                        const street = p.street || p.name || "";
                        const housenumber = p.housenumber || "";
                        const city = p.city || p.town || "";
                        const state = p.state || "";
                        
                        if (query.match(/^\d/) && !street && !housenumber) return;

                        const fullAddress = `${housenumber} ${street}, ${city}, ${state}`.replace(/^ ,/, '').trim();

                        const div = document.createElement('div');
                        div.className = 'suggestion-item';
                        div.innerHTML = `<strong>${housenumber} ${street}</strong> <br> <small>${city}, ${state}</small>`;
                        
                        div.addEventListener('click', () => {
                            addressInput.value = fullAddress.replace(/, ,/g, ','); 
                            resultsContainer.innerHTML = ''; 
                            resultsContainer.style.display = 'none'; 
                        });
                        resultsContainer.appendChild(div);
                    });
                } else {
                    resultsContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Address API error:', error);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== addressInput) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    // --- 5. СПИСКИ ТЕХНІКІВ ---
    const inputsWithLists = document.querySelectorAll('input[list]');
    inputsWithLists.forEach(input => {
        input.addEventListener('mousedown', function() {
            if (this.value !== "") {
                const currentValue = this.value;
                this.value = ""; 
                setTimeout(() => {
                    this.value = currentValue;
                    this.focus();
                }, 1);
            }
        });
    });

    // --- 6. АВТОМАТИЧНА ВИСОТА ТЕКСТОВИХ ПОЛІВ ---
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('auto-grow') && e.target.tagName.toLowerCase() === 'textarea') {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        }
    });
});
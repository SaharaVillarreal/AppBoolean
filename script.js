    /* =====================================================
       === DATI E CONFIGURAZIONE ===
       ===================================================== */

    const storageKey = "relaxfood_lists_v1";
    const listsContainer = document.querySelector("#listsContainer");
    const listCount = document.querySelector("#listCount");
    const creationPanel = document.querySelector("#creationPanel");
    const listForm = document.querySelector("#listForm");
    const photoModal = document.querySelector("#photoModal");
    const profileModal = document.querySelector("#profileModal");
    const toast = document.querySelector("#toast");

    let lists = [];
    let activeListId = null;
    let reminderSnoozedUntil = 0;
    let selectedReceiptImage = null;
    let toastTimeout = null;

    /* === DATI INIZIALI DI ESEMPIO === */

    const initialLists = [
      {
        id: "sample-conad",
        name: "Spesa Supermercato - Conad",
        date: "2024-10-23",
        source: "receipt",
        products: [
          { id: "p1", name: "Latte intero (1L)", consumed: false },
          { id: "p2", name: "Uova fresche (x6)", consumed: false },
          { id: "p3", name: "Pasta integrale (500g)", consumed: false },
          { id: "p4", name: "Pomodori", consumed: false },
          { id: "p5", name: "Pane integrale", consumed: false },
          { id: "p6", name: "Yogurt greco", consumed: false },
          { id: "p7", name: "Banane", consumed: false },
          { id: "p8", name: "Formaggio", consumed: false }
        ]
      },
      {
        id: "sample-weekly",
        name: "Spesa Settimanale Studenti",
        date: "2024-10-18",
        source: "manual",
        products: [
          { id: "p9", name: "Petto di pollo", consumed: false },
          { id: "p10", name: "Riso basmati", consumed: false },
          { id: "p11", name: "Tonno", consumed: false },
          { id: "p12", name: "Mele", consumed: false },
          { id: "p13", name: "Verdure miste", consumed: false },
          { id: "p14", name: "Olio d'oliva", consumed: false },
          { id: "p15", name: "Pane", consumed: false },
          { id: "p16", name: "Carote", consumed: false },
          { id: "p17", name: "Cipolle", consumed: false },
          { id: "p18", name: "Patate", consumed: false },
          { id: "p19", name: "Fagioli", consumed: false },
          { id: "p20", name: "Limoni", consumed: false }
        ]
      },
      {
        id: "sample-pantry",
        name: "Dispensa & Colazione",
        date: "2024-10-12",
        source: "receipt",
        products: [
          { id: "p21", name: "Biscotti avena", consumed: false },
          { id: "p22", name: "Caffè", consumed: false },
          { id: "p23", name: "Yogurt greco", consumed: false },
          { id: "p24", name: "Cereali", consumed: false },
          { id: "p25", name: "Miele", consumed: false }
        ]
      }
    ];

    /* =====================================================
       === DATE E FORMATTAZIONE ===
       ===================================================== */

    // Restituisce la data locale in formato YYYY-MM-DD.
    function getLocalDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }

    // Mostra la data nel formato italiano.
    function formatDate(dateString) {
      const parts = dateString.split("-");
      const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

      return date.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    // Classifica la scadenza in base alla data locale.
    function getExpiryState(expiryDate) {
      if (!expiryDate) return "none";
      const today = getLocalDateString(new Date());
      const future = new Date();
      future.setHours(0, 0, 0, 0);
      future.setDate(future.getDate() + 3);
      if (expiryDate < today) return "expired";
      if (expiryDate <= getLocalDateString(future)) return "soon";
      return "ok";
    }

    // Mostra una data relativa quando possibile.
    function formatRelativeDate(dateString) {
      const today = getLocalDateString(new Date());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = getLocalDateString(yesterday);

      if (dateString === today) {
        return "Oggi, " + formatDate(dateString);
      }

      if (dateString === yesterdayString) {
        return "Ieri, " + formatDate(dateString);
      }

      return formatDate(dateString);
    }

    // Aggiorna la data di sessione e quella del modulo.
    function updateDates() {
      const today = formatDate(getLocalDateString(new Date()));

      document.querySelector("#todayDate").textContent = today;
      document.querySelector("#creationDate").textContent = today;
    }

    /* =====================================================
       === ARCHIVIAZIONE LOCALE ===
       ===================================================== */

    // Carica le liste dal browser oppure prepara quelle dimostrative.
    function loadLists() {
      try {
        const savedLists = localStorage.getItem(storageKey);

        if (savedLists !== null) {
          const parsedLists = JSON.parse(savedLists);

          if (Array.isArray(parsedLists)) {
            lists = parsedLists.map(function (list) {
              list.products = (Array.isArray(list.products) ? list.products : []).map(function (product) {
                return {
                  id: product.id || createId(),
                  name: product.name || "",
                  consumed: Boolean(product.consumed),
                  expiryDate: product.expiryDate || ""
                };
              });
              return list;
            });
            saveLists();
            return;
          }
        }
      } catch (error) {
        console.warn("Impossibile leggere le liste salvate.", error);
      }

      lists = JSON.parse(JSON.stringify(initialLists));
      saveLists();
    }

    // Salva le liste nel browser, senza inviarle a un server.
    function saveLists() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(lists));
      } catch (error) {
        console.warn("Impossibile salvare le liste.", error);
        showToast("Salvataggio non riuscito. Controlla lo spazio disponibile.");
      }
    }

    /* =====================================================
       === MESSAGGI ALL'UTENTE ===
       ===================================================== */

    // Mostra un messaggio temporaneo in basso.
    function showToast(message) {
      toast.textContent = message;
      toast.classList.remove("hidden");

      if (toastTimeout !== null) {
        clearTimeout(toastTimeout);
      }

      toastTimeout = setTimeout(function () {
        toast.classList.add("hidden");
      }, 2800);
    }

    /* =====================================================
       === CREAZIONE E APERTURA DEL MODULO ===
       ===================================================== */

    let editingListId = null;

    // Aggiunge una riga con nome e data di scadenza opzionale.
    function addProductEntryRow(container, product) {
      const row = createElement("div", "product-entry");
      const fields = createElement("div", "product-entry-fields");
      const nameLabel = createElement("label", "", "Nome prodotto");
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.maxLength = 100;
      nameInput.placeholder = "Es. Latte";
      nameInput.value = product && product.name ? product.name : "";
      nameInput.className = "product-entry-name";
      nameInput.autocomplete = "off";
      if (product && product.id) {
        row.dataset.productId = product.id;
        row.dataset.consumed = String(Boolean(product.consumed));
      }
      nameLabel.appendChild(nameInput);

      const expiryLabel = createElement("label", "", "Scadenza (facoltativa)");
      const expiryInput = document.createElement("input");
      expiryInput.type = "date";
      expiryInput.className = "product-entry-expiry";
      expiryInput.value = product && product.expiryDate ? product.expiryDate : "";
      expiryInput.setAttribute("aria-label", "Data di scadenza del prodotto");
      expiryLabel.appendChild(expiryInput);
      fields.appendChild(nameLabel);
      fields.appendChild(expiryLabel);

      const actions = createElement("div", "product-entry-actions");
      const removeButton = createElement("button", "product-entry-remove", "Rimuovi riga");
      removeButton.type = "button";
      removeButton.addEventListener("click", function () {
        row.remove();
        if (container.children.length === 0) {
          addProductEntryRow(container);
        }
      });
      actions.appendChild(removeButton);
      row.appendChild(fields);
      row.appendChild(actions);
      container.appendChild(row);
      return row;
    }

    // Riempie le righe dei prodotti mantenendo le eventuali scadenze.
    function setProductEntryRows(container, products) {
      container.replaceChildren();
      if (Array.isArray(products) && products.length > 0) {
        products.forEach(function (product) {
          addProductEntryRow(container, product);
        });
      } else {
        addProductEntryRow(container);
      }
    }

    // Legge le righe compilate e crea oggetti prodotto.
    function readProductEntryRows(container) {
      const products = [];
      container.querySelectorAll(".product-entry").forEach(function (row) {
        const name = row.querySelector(".product-entry-name").value.trim();
        const expiryDate = row.querySelector(".product-entry-expiry").value;
        if (name !== "") {
          products.push({
            id: row.dataset.productId || createId(),
            name: name,
            expiryDate: expiryDate || "",
            consumed: row.dataset.consumed === "true"
          });
        }
      });
      return products;
    }

    // Apre il modulo per creare una lista nuova o modificarne una esistente.
    function openCreationForm(name, products) {
      closePhotoModal();
      creationPanel.classList.remove("hidden");
      editingListId = null;
      delete listForm.dataset.editingListId;
      listForm.onsubmit = null;
      document.querySelector("#creationTitle").textContent = "Nuova lista";
      document.querySelector("#listName").value = name || "";
      setProductEntryRows(document.querySelector("#manualProductRows"), products || []);
      updateDates();
      creationPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        document.querySelector("#listName").focus();
      }, 250);
    }

    // Chiude il modulo e azzera i campi.
    function closeCreationForm() {
      creationPanel.classList.add("hidden");
      listForm.reset();
      editingListId = null;
      delete listForm.dataset.editingListId;
      setProductEntryRows(document.querySelector("#manualProductRows"), []);
    }

    // Crea un identificatore semplice per liste e prodotti.
    function createId() {
      return "id-" + Date.now().toString(36) +
        "-" + Math.random().toString(36).slice(2, 8);
    }

    // Crea una lista con i prodotti e le relative scadenze.
    function createList(name, products, source) {
      const cleanName = name.trim();
      if (cleanName === "") {
        showToast("Inserisci il nome della lista.");
        return false;
      }
      const newList = {
        id: createId(),
        name: cleanName,
        date: getLocalDateString(new Date()),
        source: source || "manual",
        products: products.map(function (product) {
          return {
            id: product.id || createId(),
            name: product.name.trim(),
            expiryDate: product.expiryDate || "",
            consumed: Boolean(product.consumed)
          };
        })
      };
      lists.unshift(newList);
      saveLists();
      renderLists();
      updateReminder();
      return true;
    }

    // Salva il modulo manuale oppure aggiorna una lista esistente.
    listForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.querySelector("#listName").value.trim();
      const products = readProductEntryRows(document.querySelector("#manualProductRows"));
      if (!name) {
        showToast("Inserisci il nome della lista.");
        return;
      }

      if (editingListId) {
        const list = lists.find(function (item) {
          return item.id === editingListId;
        });
        if (!list) {
          showToast("La lista da modificare non è stata trovata.");
          return;
        }
        list.name = name;
        list.products = products;
        saveLists();
        renderLists();
        updateReminder();
        closeCreationForm();
        showToast("Lista aggiornata!");
        return;
      }

      if (createList(name, products, "manual")) {
        closeCreationForm();
        showToast("Lista creata e salvata!");
      }
    });

    document.querySelector("#addManualProductButton").addEventListener("click", function () {
      const row = addProductEntryRow(document.querySelector("#manualProductRows"));
      row.querySelector(".product-entry-name").focus();
    });
    document.querySelector("#newListButton").addEventListener("click", function () {
      openCreationForm("", []);
    });
    document.querySelector("#bottomCreateButton").addEventListener("click", function () {
      openCreationForm("", []);
    });
    document.querySelector("#closeCreationButton").addEventListener("click", closeCreationForm);
    document.querySelector("#cancelCreationButton").addEventListener("click", closeCreationForm);

    /* =====================================================
       === RENDERING DELLE SCHEDE ===
       ===================================================== */

    // Crea un elemento HTML e gli assegna testo e classi.
    function createElement(tagName, className, text) {
      const element = document.createElement(tagName);

      if (className) {
        element.className = className;
      }

      if (text !== undefined) {
        element.textContent = text;
      }

      return element;
    }

    // Crea un'icona Material Symbols.
    function createIcon(iconName, className) {
      const icon = createElement("span", "material-symbols-rounded", iconName);

      if (className) {
        icon.classList.add(className);
      }

      return icon;
    }

    // Restituisce una scheda completa per una lista.
    function createListCard(list) {
      const card = createElement("article", "list-card");
      card.dataset.listId = list.id;

      const header = createElement("div", "list-card-header");
      const titleWrap = createElement("div", "list-title-wrap");
      const title = createElement("h4", "list-title", list.name);
      const meta = createElement("div", "list-meta");

      const date = createElement("span", "", formatRelativeDate(list.date));
      const separator = createElement("span", "", "•");
      const source = createElement("span", "list-source");

      const sourceIcon = list.source === "receipt" ? "receipt_long" : "edit_note";
      const sourceName = list.source === "receipt" ? "Scontrino" : "Manuale";

      source.appendChild(createIcon(sourceIcon));
      source.appendChild(document.createTextNode(
        sourceName + " (" + list.products.length + " prodotti)"
      ));

      meta.appendChild(date);
      meta.appendChild(separator);
      meta.appendChild(source);

      titleWrap.appendChild(title);
      titleWrap.appendChild(meta);

      const badge = createElement("div", "document-badge");
      badge.appendChild(createIcon(
        list.source === "receipt" ? "document_scanner" : "edit"
      ));
      badge.appendChild(createElement(
        "small", "", list.source === "receipt" ? "DOC" : "MAN"
      ));

      const menuWrap = createElement("div", "list-menu-wrap");
      const menuButton = createElement("button", "list-menu-button");
      menuButton.type = "button";
      menuButton.setAttribute("aria-label", "Altre azioni per " + list.name);
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.appendChild(createIcon("more_vert"));

      const menu = createElement("div", "list-menu hidden");
      menu.appendChild(createMenuButton("add", "Aggiungi prodotto", "add-product", list.id));
      menu.appendChild(createMenuButton("edit_note", "Modifica lista", "edit-list", list.id));
      menu.appendChild(createMenuButton("delete", "Elimina lista", "delete-list", list.id, true));

      menuButton.addEventListener("click", function (event) {
        event.stopPropagation();

        const wasOpen = !menu.classList.contains("hidden");

        document.querySelectorAll(".list-menu").forEach(function (otherMenu) {
          otherMenu.classList.add("hidden");
        });

        document.querySelectorAll(".list-menu-button").forEach(function (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        });

        if (!wasOpen) {
          menu.classList.remove("hidden");
          menuButton.setAttribute("aria-expanded", "true");
        }
      });

      menuWrap.appendChild(menuButton);
      menuWrap.appendChild(menu);

      header.appendChild(titleWrap);

      if (list.source === "receipt") {
        header.appendChild(badge);
      } else {
        header.appendChild(menuWrap);
      }

      if (list.source === "receipt") {
        const sourceMenuWrap = menuWrap;
        header.appendChild(sourceMenuWrap);
      }

      const preview = createElement("div", "products-preview");
      preview.appendChild(createElement("span", "preview-label", "Articoli in evidenza:"));

      const chips = createElement("div", "product-chips");

      if (list.products.length === 0) {
        chips.appendChild(createElement("span", "product-chip", "Nessun prodotto"));
      } else {
        list.products.slice(0, 5).forEach(function (product) {
          const expiryState = getExpiryState(product.expiryDate);
          const chip = createElement(
            "span",
            "product-chip" + (product.consumed ? " consumed" : "") +
              (expiryState === "expired" || expiryState === "soon" ? " expiring" : ""),
            product.name + (product.expiryDate ? " · " + formatDate(product.expiryDate) : "")
          );
          if (product.expiryDate) {
            chip.title = expiryState === "expired" ? "Prodotto scaduto" :
              expiryState === "soon" ? "Prodotto in scadenza entro 3 giorni" :
              "Scadenza: " + formatDate(product.expiryDate);
          }
          chips.appendChild(chip);
        });

        if (list.products.length > 5) {
          chips.appendChild(createElement(
            "span", "product-chip", "+" + (list.products.length - 5) + " altri"
          ));
        }
      }

      preview.appendChild(chips);

      const unconsumedCount = list.products.filter(function (product) {
        return !product.consumed;
      }).length;

      const status = createElement("div", "status-bar");
      status.appendChild(createIcon(
        unconsumedCount === 0 && list.products.length > 0 ? "check_circle" : "schedule"
      ));

      if (list.products.length > 0 && unconsumedCount === 0) {
        status.classList.add("complete");
        status.appendChild(document.createTextNode("Tutti i prodotti consumati"));
      } else if (list.products.length === 0) {
        status.appendChild(document.createTextNode("Aggiungi il primo prodotto"));
      } else {
        status.appendChild(document.createTextNode(
          unconsumedCount + " prodotti da verificare"
        ));
      }

      const actions = createElement("div", "card-actions");

      const viewButton = createElement("button", "primary-button");
      viewButton.type = "button";
      viewButton.appendChild(createIcon("visibility"));
      viewButton.appendChild(document.createTextNode(" Visualizza"));
      viewButton.addEventListener("click", function () {
        toggleListDetails(list.id);
      });

      const addButton = createElement("button", "secondary-button");
      addButton.type = "button";
      addButton.appendChild(createIcon("add"));
      addButton.appendChild(document.createTextNode(" Aggiungi"));
      addButton.addEventListener("click", function () {
        showProductInput(list.id);
      });

      actions.appendChild(viewButton);
      actions.appendChild(addButton);

      card.appendChild(header);
      card.appendChild(preview);
      card.appendChild(status);
      card.appendChild(actions);

      if (activeListId === list.id) {
        card.appendChild(createListDetails(list));
      }

      return card;
    }

    // Costruisce un pulsante del menu della singola lista.
    function createMenuButton(iconName, label, action, listId, isDanger) {
      const button = createElement(
        "button",
        isDanger ? "delete-action" : "",
        ""
      );

      button.type = "button";
      button.appendChild(createIcon(iconName));
      button.appendChild(document.createTextNode(label));
      button.dataset.action = action;
      button.dataset.listId = listId;

      button.addEventListener("click", function (event) {
        event.stopPropagation();
        handleListAction(action, listId);
      });

      return button;
    }

    // Disegna tutte le schede e aggiorna il conteggio.
    function renderLists() {
      listsContainer.replaceChildren();

      listCount.textContent = lists.length + (lists.length === 1 ? " lista" : " liste");

      if (lists.length === 0) {
        const empty = createElement("div", "empty-state");
        empty.appendChild(createIcon("inventory_2"));
        empty.appendChild(createElement(
          "p", "", "Non hai ancora creato liste. Aggiungi la tua prima lista per iniziare."
        ));
        listsContainer.appendChild(empty);
        return;
      }

      lists.forEach(function (list) {
        listsContainer.appendChild(createListCard(list));
      });
    }

    /* =====================================================
       === DETTAGLIO E GESTIONE DEI PRODOTTI ===
       ===================================================== */

    // Crea la vista dei prodotti e consente di modificare le scadenze.
    function createListDetails(list) {
      const panel = createElement("div", "detail-panel");
      panel.appendChild(createElement("h4", "", "Prodotti e date di scadenza"));
      if (list.products.length === 0) {
        panel.appendChild(createElement("p", "muted", "Questa lista è vuota. Aggiungi un prodotto qui sotto."));
      }

      list.products.forEach(function (product) {
        const row = createElement("div", "detail-product");
        const checkbox = document.createElement("input");
        const main = createElement("div", "detail-product-main");
        const label = document.createElement("label");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(product.consumed);
        checkbox.id = "product-" + product.id;
        label.htmlFor = checkbox.id;
        label.appendChild(createElement("span", "", product.name));
        main.appendChild(label);
        if (product.consumed) main.appendChild(createElement("small", "", "Segnato come consumato"));

        const expiryLabel = createElement("label", "expiry-field-label", "Scadenza (facoltativa)");
        const expiryInput = document.createElement("input");
        expiryInput.type = "date";
        expiryInput.className = "detail-expiry-input";
        expiryInput.value = product.expiryDate || "";
        expiryInput.setAttribute("aria-label", "Data di scadenza di " + product.name);
        expiryLabel.appendChild(expiryInput);
        main.appendChild(expiryLabel);

        if (product.expiryDate) {
          const state = getExpiryState(product.expiryDate);
          const badgeClass = "expiry-badge" + (state === "soon" ? " soon" : state === "expired" ? " expired" : "");
          const badgeText = state === "expired" ? "Scaduto il " : state === "soon" ? "Scade il " : "Scadenza: ";
          main.appendChild(createElement("span", badgeClass, badgeText + formatDate(product.expiryDate)));
        }

        checkbox.addEventListener("change", function () {
          product.consumed = checkbox.checked;
          saveLists();
          renderLists();
          updateReminder();
        });
        expiryInput.addEventListener("change", function () {
          product.expiryDate = expiryInput.value || "";
          saveLists();
          renderLists();
          updateReminder();
          showToast(product.expiryDate ? "Data di scadenza aggiornata." : "Data di scadenza rimossa.");
        });

        const removeButton = createElement("button", "remove-product-button");
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", "Rimuovi " + product.name);
        removeButton.appendChild(createIcon("delete"));
        removeButton.addEventListener("click", function () {
          removeProduct(list.id, product.id);
        });
        row.appendChild(checkbox);
        row.appendChild(main);
        row.appendChild(removeButton);
        panel.appendChild(row);
      });

      const addRow = createElement("form", "detail-add-row");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Nuovo prodotto...";
      input.setAttribute("aria-label", "Nome del nuovo prodotto");
      input.maxLength = 100;
      input.required = true;
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.setAttribute("aria-label", "Aggiungi prodotto");
      submitButton.appendChild(createIcon("add"));
      addRow.appendChild(input);
      addRow.appendChild(submitButton);
      addRow.addEventListener("submit", function (event) {
        event.preventDefault();
        const productName = input.value.trim();
        if (productName !== "") addProduct(list.id, productName);
      });
      panel.appendChild(addRow);
      return panel;
    }

    // Apre o chiude il dettaglio di una lista.
    function toggleListDetails(listId) {
      if (activeListId === listId) {
        activeListId = null;
      } else {
        activeListId = listId;
      }

      renderLists();
    }

    // Aggiunge un prodotto alla lista indicata.
    function addProduct(listId, productName) {
      const list = lists.find(function (item) {
        return item.id === listId;
      });

      if (!list) {
        return;
      }

      const cleanName = productName.trim();

      if (cleanName === "") {
        showToast("Inserisci il nome del prodotto.");
        return;
      }

      list.products.push({
        id: createId(),
        name: cleanName,
        expiryDate: "",
        consumed: false
      });

      activeListId = listId;
      saveLists();
      renderLists();
      updateReminder();
      showToast("Prodotto aggiunto!");
    }

    // Elimina un singolo prodotto dopo conferma.
    function removeProduct(listId, productId) {
      const list = lists.find(function (item) {
        return item.id === listId;
      });

      if (!list) {
        return;
      }

      const product = list.products.find(function (item) {
        return item.id === productId;
      });

      if (!product || !confirm('Vuoi eliminare "' + product.name + '"?')) {
        return;
      }

      list.products = list.products.filter(function (item) {
        return item.id !== productId;
      });

      saveLists();
      renderLists();
      updateReminder();
      showToast("Prodotto eliminato.");
    }

    // Porta il dettaglio della lista in primo piano e attiva il campo.
    function showProductInput(listId) {
      activeListId = listId;
      renderLists();

      const card = listsContainer.querySelector('[data-list-id="' + listId + '"]');

      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(function () {
          const input = card.querySelector(".detail-add-row input");

          if (input) {
            input.focus();
          }
        }, 250);
      }
    }

    /* =====================================================
       === MENU: MODIFICA ED ELIMINAZIONE ===
       ===================================================== */

    // Esegue l'azione scelta nel menu con i tre puntini.
    function handleListAction(action, listId) {
      const list = lists.find(function (item) {
        return item.id === listId;
      });

      if (!list) {
        return;
      }

      if (action === "add-product") {
        activeListId = listId;
        showProductInput(listId);
      }

      if (action === "edit-list") {
        openCreationForm(list.name, list.products);
        editingListId = listId;
        listForm.dataset.editingListId = listId;
        document.querySelector("#creationTitle").textContent = "Modifica lista";
      }

      if (action === "delete-list") {
        if (confirm('Vuoi eliminare la lista "' + list.name + '" e tutti i suoi prodotti?')) {
          lists = lists.filter(function (item) {
            return item.id !== listId;
          });

          if (activeListId === listId) {
            activeListId = null;
          }

          saveLists();
          renderLists();
          updateReminder();
          showToast("Lista eliminata.");
        }
      }

      document.querySelectorAll(".list-menu").forEach(function (menu) {
        menu.classList.add("hidden");
      });
    }

    // Chiude i menu quando si tocca un'altra parte della pagina.
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".list-menu-wrap")) {
        document.querySelectorAll(".list-menu").forEach(function (menu) {
          menu.classList.add("hidden");
        });

        document.querySelectorAll(".list-menu-button").forEach(function (button) {
          button.setAttribute("aria-expanded", "false");
        });
      }
    });

    /* =====================================================
       === PROMEMORIA CONSUMI ===
       ===================================================== */

    // Trova il primo prodotto ancora da consumare e aggiorna l'avviso.
    function updateReminder() {
      const reminderCard = document.querySelector("#reminderCard");
      const reminderText = document.querySelector("#reminderText");
      const consumedButton = document.querySelector("#consumedButton");
      const snoozeButton = document.querySelector("#snoozeButton");

      let reminderProduct = null;
      let reminderList = null;

      lists.some(function (list) {
        return list.products.some(function (product) {
          if (!product.consumed) {
            reminderProduct = product;
            reminderList = list;
            return true;
          }

          return false;
        });
      });

      if (!reminderProduct) {
        reminderText.textContent = "Non ci sono prodotti da verificare. Ottimo lavoro!";
        consumedButton.disabled = true;
        snoozeButton.disabled = true;
        return;
      }

      consumedButton.disabled = false;
      snoozeButton.disabled = false;

      if (Date.now() < reminderSnoozedUntil) {
        reminderText.textContent = "Promemoria rimandato. Prossimo prodotto da verificare: " +
          reminderProduct.name + ".";
        return;
      }

      reminderText.replaceChildren();
      reminderText.appendChild(document.createTextNode("Prodotto da verificare: "));

      const strongName = createElement("strong", "", reminderProduct.name);
      reminderText.appendChild(strongName);

      reminderText.appendChild(document.createTextNode(
        ' nella lista "' + reminderList.name + '".'
      ));
      if (reminderProduct.expiryDate) {
        const expiryState = getExpiryState(reminderProduct.expiryDate);
        const expiryMessage = expiryState === "expired" ? " Scaduto il " :
          expiryState === "soon" ? " Scade il " : " Scadenza: ";
        reminderText.appendChild(document.createTextNode(
          expiryMessage + formatDate(reminderProduct.expiryDate) + "."
        ));
      } else {
        reminderText.appendChild(document.createTextNode(" È ora di verificare se consumarlo!"));
      }

      consumedButton.onclick = function () {
        reminderProduct.consumed = true;

        saveLists();
        renderLists();
        updateReminder();

        showToast("Prodotto segnato come consumato.");
      };

      snoozeButton.onclick = function () {
        reminderSnoozedUntil = Date.now() + 60 * 60 * 1000;
        reminderText.textContent = "Promemoria rimandato di un'ora. Puoi continuare a gestire le tue liste.";
        showToast("Promemoria rimandato di un'ora.");
      };
    }

    /* =====================================================
       === FOTOCAMERA E IMPORTAZIONE DELLO SCONTRINO ===
       ===================================================== */

    // Apre la finestra che permette di acquisire una foto.
    function openPhotoModal() {
      creationPanel.classList.add("hidden");
      photoModal.classList.remove("hidden");

      document.querySelector("#receiptListName").value = "";
      setProductEntryRows(document.querySelector("#receiptProductRows"), []);
      document.querySelector("#photoFeedback").textContent = "";

      selectedReceiptImage = null;

      const preview = document.querySelector("#receiptPreview");
      preview.src = "";
      preview.classList.add("hidden");
    }

    // Chiude la finestra di acquisizione.
    function closePhotoModal() {
      photoModal.classList.add("hidden");
    }

    document.querySelector("#receiptButton").addEventListener("click", openPhotoModal);
    document.querySelector("#closePhotoButton").addEventListener("click", closePhotoModal);
    document.querySelector("#cancelPhotoButton").addEventListener("click", closePhotoModal);
    document.querySelector("#addReceiptProductButton").addEventListener("click", function () {
      const row = addProductEntryRow(document.querySelector("#receiptProductRows"));
      row.querySelector(".product-entry-name").focus();
    });

    // Gestisce la foto scelta o scattata dall'utente.
    document.querySelector("#receiptInput").addEventListener("change", function (event) {
      const file = event.target.files[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        document.querySelector("#photoFeedback").textContent =
          "Seleziona un file immagine valido.";
        return;
      }

      selectedReceiptImage = file;

      const preview = document.querySelector("#receiptPreview");
      const imageUrl = URL.createObjectURL(file);

      preview.src = imageUrl;
      preview.classList.remove("hidden");

      const feedback = document.querySelector("#photoFeedback");
      feedback.textContent = "Immagine caricata. Provo a riconoscere il testo...";

      // Suggerisce un nome per la lista se il campo è vuoto.
      const nameInput = document.querySelector("#receiptListName");

      if (nameInput.value.trim() === "") {
        nameInput.value = "Spesa del " + formatDate(getLocalDateString(new Date()));
      }

      recognizeReceiptText(file);
    });

    // Tenta il riconoscimento del testo con TextDetector, se disponibile.
    async function recognizeReceiptText(file) {
      const feedback = document.querySelector("#photoFeedback");
      const productsField = document.querySelector("#receiptProductRows");

      if (!("TextDetector" in window)) {
        feedback.textContent =
          "Riconoscimento automatico non disponibile in questo browser. " +
          "Puoi aggiungere i prodotti manualmente usando le righe qui sopra.";
        return;
      }

      try {
        const imageBitmap = await createImageBitmap(file);
        const detector = new TextDetector();
        const results = await detector.detect(imageBitmap);

        imageBitmap.close();

        const lines = [];

        results.forEach(function (result) {
          const text = result.rawValue.trim();

          if (text !== "") {
            lines.push(text);
          }
        });

        if (lines.length > 0) {
          setProductEntryRows(productsField, lines.map(function (line) {
            return { name: line, expiryDate: "" };
          }));
          feedback.textContent =
            "Testo estratto. Controlla i risultati e rimuovi prezzi o righe inutili prima di creare la lista.";
        } else {
          feedback.textContent =
            "Nessun testo rilevato. Prova una foto più nitida o inserisci i prodotti manualmente.";
        }
      } catch (error) {
        console.warn("Riconoscimento testo non riuscito.", error);

        feedback.textContent =
          "Non è stato possibile leggere automaticamente lo scontrino. " +
          "Puoi comunque aggiungere i prodotti manualmente.";
      }
    }

    // Crea la lista usando i dati della finestra dello scontrino.
    document.querySelector("#createFromPhotoButton").addEventListener("click", function () {
      const name = document.querySelector("#receiptListName").value.trim();
      const products = readProductEntryRows(document.querySelector("#receiptProductRows"));

      if (!name) {
        showToast("Inserisci il nome della lista.");
        document.querySelector("#receiptListName").focus();
        return;
      }

      if (products.length === 0) {
        const shouldContinue = confirm(
          "Non hai inserito prodotti. Vuoi creare comunque una lista vuota?"
        );
        if (!shouldContinue) return;
      }

      if (createList(name, products, "receipt")) {
        closePhotoModal();
        showToast("Lista da scontrino creata!");
      }
    });

    /* =====================================================
       === PROFILO ===
       ===================================================== */

    // Mostra il riepilogo delle liste salvate.
    function openProfile() {
      document.querySelector("#profileStats").textContent =
        "Liste salvate: " + lists.length +
        ". Prodotti totali: " +
        lists.reduce(function (total, list) {
          return total + list.products.length;
        }, 0);

      profileModal.classList.remove("hidden");
    }

    // Chiude il profilo.
    function closeProfile() {
      profileModal.classList.add("hidden");
    }

    document.querySelector("#profileButton").addEventListener("click", openProfile);
    document.querySelector("#closeProfileButton").addEventListener("click", closeProfile);
    document.querySelector("#closeProfileAction").addEventListener("click", closeProfile);

    /* =====================================================
       === CHIUSURA DELLE FINESTRE ===
       ===================================================== */

    // Chiude le finestre modali quando si preme Escape.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePhotoModal();
        closeProfile();
      }
    });

    // Chiude le finestre cliccando sullo sfondo.
    photoModal.addEventListener("click", function (event) {
      if (event.target === photoModal) {
        closePhotoModal();
      }
    });

    profileModal.addEventListener("click", function (event) {
      if (event.target === profileModal) {
        closeProfile();
      }
    });

    /* =====================================================
       === AVVIO DELL'APPLICAZIONE ===
       ===================================================== */

    // Inizializza i dati e mostra la schermata iniziale.
    function initializeApp() {
      updateDates();
      loadLists();
      renderLists();
      updateReminder();
    }

    initializeApp();

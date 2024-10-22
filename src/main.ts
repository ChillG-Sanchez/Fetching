import './style.css'

interface Product {
  id: number;
  ID: number;
  Rating: number;
  status: string;
}

const API_URL = 'https://retoolapi.dev/EgMS0H/data';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form') as HTMLFormElement;
  const tableBody = document.getElementById('product-table-body') as HTMLTableSectionElement;
  const searchStatusInput = document.getElementById('search-status') as HTMLInputElement;
  const searchIdInput = document.getElementById('search-id') as HTMLInputElement;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = (document.getElementById('id') as HTMLInputElement).valueAsNumber;
    const ID = (document.getElementById('ID') as HTMLInputElement).valueAsNumber;
    const Rating = (document.getElementById('rating') as HTMLInputElement).valueAsNumber;
    const status = (document.getElementById('status') as HTMLInputElement).value;

    if (Rating < 1 || Rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    const newProduct: Product = { id, ID, Rating, status };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      loadProducts();
      form.reset();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  });

  async function loadProducts() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const products: Product[] = await response.json();

      tableBody.innerHTML = '';
      products.sort((a, b) => a.Rating - b.Rating).forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td contenteditable="false">${product.id}</td>
          <td contenteditable="false">${product.ID}</td>
          <td contenteditable="false">${product.Rating}</td>
          <td contenteditable="false">${product.status}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${product.id}">Edit</button>
            <button class="btn btn-success btn-sm save-btn" data-id="${product.id}" style="display:none;">Save</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const ID = (event.target as HTMLButtonElement).dataset.id;
          await deleteProduct(Number(ID));
          const row = (event.target as HTMLButtonElement).closest('tr');
          if (row) {
            row.remove();
          }
        });
      });

      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
          const row = (event.target as HTMLButtonElement).closest('tr');
          if (row) {
            row.querySelectorAll('td[contenteditable]').forEach(cell => {
              cell.setAttribute('contenteditable', 'true');
            });
            row.querySelector('.edit-btn')!.style.display = 'none';
            row.querySelector('.save-btn')!.style.display = 'inline-block';
          }
        });
      });

      document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
          const row = (event.target as HTMLButtonElement).closest('tr');
          if (row) {
            const id = Number(row.cells[0].textContent);
            const ID = Number(row.cells[1].textContent);
            const Rating = Number(row.cells[2].textContent);
            const status = row.cells[3].textContent || '';

            if (Rating < 1 || Rating > 5) {
              alert('Rating must be between 1 and 5');
              return;
            }

            const updatedProduct: Product = { id, ID, Rating, status };

            try {
              const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
              });

              if (!response.ok) {
                throw new Error('Network response was not ok');
              }

              row.querySelectorAll('td[contenteditable]').forEach(cell => {
                cell.setAttribute('contenteditable', 'false');
              });
              row.querySelector('.edit-btn')!.style.display = 'inline-block';
              row.querySelector('.save-btn')!.style.display = 'none';
            } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
            }
          }
        });
      });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  async function deleteProduct(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      loadProducts();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  function filterProducts() {
    const searchStatusTerm = searchStatusInput.value.toLowerCase();
    const searchIdTerm = searchIdInput.value;

    const rows = tableBody.getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
      const statusCell = row.getElementsByTagName('td')[3];
      const idCell = row.getElementsByTagName('td')[0];

      if (statusCell && idCell) {
        const statusText = statusCell.textContent || statusCell.innerText;
        const idText = idCell.textContent || idCell.innerText;

        const matchesStatus = statusText.toLowerCase().indexOf(searchStatusTerm) > -1;
        const matchesId = idText.indexOf(searchIdTerm) > -1;

        if (matchesStatus && matchesId) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      }
    });
  }

  searchStatusInput.addEventListener('input', filterProducts);
  searchIdInput.addEventListener('input', filterProducts);

  loadProducts();
});
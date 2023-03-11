const sendForm = async (formData, type) => {
  const url = `/${type}`;

  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    document.location = '/success';
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  const { pathname } = location;
  let type;

  if (pathname.includes('add')) {
    type = 'add';
  }

  if (pathname.includes('edit')) {
    type = 'edit';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);

    await sendForm(data, type);
  });
});

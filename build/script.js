document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.button_type_delete');

  deleteButtons.forEach(deleteButton => {
    deleteButton.addEventListener('click', async () => {
      const articleId = deleteButton.closest('article').id;

      const isConfirmed = confirm('Удалить рецепт?');

      if (isConfirmed) {
        try {
          await fetch('/', {
            method: 'DELETE',
            body: JSON.stringify({ id: articleId }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          document.location.reload();
        } catch (error) {
          console.error(error);
        }
      }
    });
  });
});

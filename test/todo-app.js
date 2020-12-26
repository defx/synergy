import {
  TodoApp,
  markup,
  storage,
} from '../examples/todo-app/index.js';

describe('Todo List', () => {
  let view, rootNode;
  beforeEach(() => {
    rootNode = mount(
      html`<div id="container"></div>`
    );

    view = synergy.render(
      rootNode,
      TodoApp(),
      markup
    );
  });

  const app = {
    get footer() {
      return $('footer');
    },
    get main() {
      return $('main');
    },
    get newTodoInput() {
      return $('input[name="newTodo"]');
    },
    get todos() {
      return $$('li.todo');
    },
    get todoInputs() {
      return $$('li.todo input.edit');
    },
    get todoLabels() {
      return $$('li.todo label');
    },
    get toggles() {
      return $$('li.todo input.toggle');
    },
    get allDoneCheckbox() {
      return $('input[name="allDone"]');
    },
    get todoCheckboxes() {
      return $$('li.todo input[type="checkbox"]');
    },
    get deleteButtons() {
      return $$('li.todo button.delete');
    },
    get count() {
      return $('#count').textContent;
    },
    get clearCompleted() {
      return $('#clearCompleted');
    },
    get clearCompletedText() {
      return this.clearCompleted.textContent;
    },
    getFilterByValue(value) {
      return $(
        `#filterList input[value="${value}"]`
      );
    },
    get editInputs() {
      return $$('li.todo input.edit');
    },
  };

  const isDisplayed = (node) => {
    return !!(
      node.offsetWidth ||
      node.offsetHeight ||
      node.getClientRects().length
    );
  };

  const isHidden = (node) => {
    return !isDisplayed(node);
  };

  const inputText = (input, text) => {
    input.value = text;
    input.dispatchEvent(
      new Event('input', {
        bubbles: true,
      })
    );
  };

  const addTodo = async (title) => {
    let input = app.newTodoInput;

    inputText(input, title);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      })
    );

    return nextFrame();
  };

  describe('No Todos', () => {
    it('should hide #main and #footer', () => {
      assert.ok(app.main.hasAttribute('hidden'));
      assert.ok(
        app.footer.hasAttribute('hidden')
      );
    });
  });

  describe('New Todo', () => {
    it('should allow me to add todo items', async () => {
      const title1 = 'walk the dog';
      const title2 = 'feed the cat';
      await addTodo(title1);
      await addTodo(title2);
      let todoLabels = app.todoLabels;
      assert.equal(todoLabels.length, 2);
      assert.equal(
        todoLabels[0].textContent.trim(),
        title1
      );
      assert.equal(
        todoLabels[1].textContent.trim(),
        title2
      );
      assert.equal(
        storage.get('todos').length,
        2
      );
    });

    it('should clear text input field when an item is added', async () => {
      await addTodo('walk the dog');
      assert.equal(app.newTodoInput.value, '');
      assert.equal(
        storage.get('todos').length,
        1
      );
    });

    it('should trim text input', async () => {
      await addTodo('     walk the dog     ');
      assert.equal(
        app.todoLabels[0].textContent.trim(),
        'walk the dog'
      );
    });

    it('should show #main and #footer when items added', async () => {
      await addTodo('walk the dog');
      assert.isNotOk(
        app.main.hasAttribute('hidden')
      );
      assert.isNotOk(
        app.footer.hasAttribute('hidden')
      );
    });
  });
  describe('Mark all as completed', () => {
    it('should allow me to mark all items as completed', async () => {
      await addTodo('walk the dog');
      await addTodo('feed the cat');

      app.allDoneCheckbox.click();
      await nextFrame();
      assert.ok(
        app.todoCheckboxes.every(
          (node) => node.checked
        )
      );
      assert.ok(
        storage
          .get('todos')
          .every((todo) => todo.completed)
      );
    });
    it('should allow me to clear the completion state of all items', async () => {
      await addTodo('walk the dog');
      await addTodo('feed the cat');
      app.allDoneCheckbox.click();
      app.allDoneCheckbox.click();
      await nextFrame();
      assert.equal(
        app.allDoneCheckbox.checked,
        false
      );
      assert.ok(
        app.todoCheckboxes.every(
          (node) => !node.checked
        )
      );
      assert.ok(
        storage
          .get('todos')
          .every((todo) => !todo.completed)
      );
    });
    it('complete all checkbox should update state when items are completed', async () => {
      await addTodo('walk the dog');
      await addTodo('feed the cat');
      app.todoCheckboxes.forEach((node) =>
        node.click()
      );
      await nextFrame();
      assert.ok(app.allDoneCheckbox.checked);
    });
  });
  describe('Item', () => {
    it('should allow me to mark items as complete', async () => {
      await addTodo('walk the dog');
      await addTodo('feed the cat');
      app.todoCheckboxes.forEach((node) =>
        node.click()
      );
      await nextFrame();
      assert.ok(
        storage
          .get('todos')
          .every((todo) => todo.completed)
      );
    });
    it('should allow me to un-mark items as complete', async () => {
      await addTodo('walk the dog');
      await addTodo('feed the cat');
      app.todoCheckboxes.forEach((node) =>
        node.click()
      );
      app.todoCheckboxes.forEach((node) =>
        node.click()
      );
      await nextFrame();
      assert.ok(
        storage
          .get('todos')
          .every((todo) => !todo.completed)
      );
    });
    it('should allow me to edit an item', async () => {
      await addTodo('walk the dog');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );

      const newTitle = 'walk the frog';

      inputText(app.todoInputs[0], newTitle);

      app.todoInputs[0].dispatchEvent(
        new Event('blur', {
          bubbles: true,
        })
      );

      await nextFrame();
      assert.equal(
        app.todoLabels[0].textContent.trim(),
        newTitle
      );
    });
    xit('should show the remove button on hover', async () => {});
  });
  describe('Editing', () => {
    it('should hide other controls when editing', async () => {
      await addTodo('walk the dog');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );
      await nextFrame();
      assert.ok(isHidden(app.toggles[0]));
      assert.ok(isHidden(app.todoLabels[0]));
      assert.ok(isHidden(app.deleteButtons[0]));
    });

    it('should populate input with the current title', async () => {
      await addTodo('jabba the hut');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );
      await nextFrame();
      assert.equal(
        app.editInputs[0].value,
        'jabba the hut'
      );
    });

    it('should save edits on enter', async () => {
      await addTodo('walk the dog');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );

      const newTitle = 'walk the walk';

      inputText(app.todoInputs[0], newTitle);

      app.todoInputs[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          keyCode: 13,
          bubbles: true,
        })
      );

      await nextFrame();

      assert.equal(
        app.todoLabels[0].textContent.trim(),
        newTitle
      );
      assert.equal(
        storage.get('todos')[0].title,
        newTitle
      );
      assert.equal(
        storage.get('todos')[0].editing,
        false
      );
    });

    xit('should save edits on blur', async () => {
      //...
    });

    xit('should trim entered text', async () => {
      //...
    });

    it('should remove the item if an empty text string was entered', async () => {
      await addTodo('walk the dog');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );

      const newTitle = ' ';

      inputText(app.todoInputs[0], newTitle);

      app.todoInputs[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          keyCode: 13,
          bubbles: true,
        })
      );

      await nextFrame();
      assert.equal(app.todos.length, 0);
    });

    it('should cancel edits on escape', async () => {
      const title = 'walk the dog';

      await addTodo(title);
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );

      const titleEdit = 'walk the walk';

      inputText(app.todoInputs[0], titleEdit);

      app.todoInputs[0].dispatchEvent(
        new KeyboardEvent('keydown', {
          keyCode: 27,
          bubbles: true,
        })
      );

      await nextFrame();

      assert.equal(
        app.todoLabels[0].textContent.trim(),
        title
      );
      assert.equal(
        storage.get('todos')[0].title,
        title
      );
      assert.equal(
        storage.get('todos')[0].editing,
        false
      );
    });
  });

  describe('counter', () => {
    it('should display the current number of todo items', async () => {
      await addTodo('first thing');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );
      assert.equal(app.count, '1 item left');
      await addTodo('second thing');
      app.todoLabels[0].dispatchEvent(
        new Event('dblclick', {
          bubbles: true,
        })
      );
      assert.equal(app.count, '2 items left');

      app.deleteButtons[0].click();

      await nextFrame();

      assert.equal(app.count, '1 item left');
    });
  });

  describe('Clear completed button', () => {
    it('should display the number of completed items', async () => {
      await addTodo('first thing');
      assert.equal(
        app.clearCompletedText,
        'clear completed (0)'
      );
      app.todoCheckboxes[0].click();
      await nextFrame();
      assert.equal(
        app.clearCompletedText,
        'clear completed (1)'
      );
    });
    it('should remove completed items when clicked', async () => {
      await addTodo('first thing');
      await addTodo('second thing');
      assert.equal(
        app.clearCompletedText,
        'clear completed (0)'
      );
      app.todoCheckboxes[0].click();
      await nextFrame();
      assert.equal(
        app.clearCompletedText,
        'clear completed (1)'
      );
      app.clearCompleted.click();
      await nextFrame();
      assert.equal(app.todos.length, 1);
      assert.equal(
        app.todoLabels[0].textContent,
        'second thing'
      );
    });
    it('should be hidden when there are no items that are completed', async () => {
      await addTodo('first thing');
      assert.ok(isHidden(clearCompleted));
      app.todoCheckboxes[0].click();
      await nextFrame();
      assert.ok(isDisplayed(clearCompleted));
    });
  });

  describe('Persistence', () => {
    xit('should persist its data', async () => {});
  });

  describe('Routing', () => {
    it('should allow me to display active items', async () => {
      await addTodo('first thing');
      await addTodo('second thing');
      app.todoCheckboxes[0].click();
      app.getFilterByValue('active').click();
      await nextFrame();
      assert.equal(1, 1);
      assert.equal(app.todos.length, 1);
      assert.equal(
        app.todoLabels[0].textContent.trim(),
        'second thing'
      );
    });
    it('should allow me to display completed items', async () => {
      await addTodo('first thing');
      await addTodo('second thing');
      app.todoCheckboxes[0].click();
      app.getFilterByValue('done').click();
      await nextFrame();
      assert.equal(1, 1);
      assert.equal(app.todos.length, 1);
      assert.equal(
        app.todoLabels[0].textContent.trim(),
        'first thing'
      );
    });
    it('should allow me to display all items', async () => {
      await addTodo('first thing');
      await addTodo('second thing');
      app.todoCheckboxes[0].click();
      app.getFilterByValue('done').click();
      app.getFilterByValue('all').click();
      await nextFrame();
      assert.equal(1, 1);
      assert.equal(app.todos.length, 2);
      assert.equal(
        app.todoLabels[0].textContent.trim(),
        'first thing'
      );
      assert.equal(
        app.todoLabels[1].textContent.trim(),
        'second thing'
      );
    });
    xit('should highlight the currently applied filter', async () => {
      //...
    });
  });
});

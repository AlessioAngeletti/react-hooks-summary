import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredient, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredient, action.ingredient];
    case 'DELETE':
      return currentIngredient.filter((ing) => ing.id !== action.id);
    default:
      throw new Error('Should not get there');
  }
};

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { ...httpState, loading: true };
    case 'RESPONSE':
      return { ...httpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...httpState, error: null };
    default:
      throw new Error('Should not get there');
  }
};

function Ingredients() {
  const [userState, dispatchUser] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });

  useEffect(() => {
    console.log('RENDERING INGREDIENTS');
  });

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatchUser({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({ type: 'SEND' });

    fetch(
      'https://react-http-cb431-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json',
      {
        method: 'POST',
        body: JSON.stringify(ingredient),
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then((res) => {
        dispatchHttp({ type: 'RESPONSE' });
        return res.json();
      })
      .then((resData) => {
        dispatchUser({
          type: 'ADD',
          ingredient: { id: resData.name, ...ingredient },
        });
      })
      .catch((error) => {
        dispatchHttp({ type: 'ERROR', errorMessage: 'omething went wrong!' });
      });
  }, []);

  const removeIngredientHandler = useCallback((ingredientId) => {
    dispatchHttp({ type: 'SEND' });

    fetch(
      `https://react-http-cb431-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${ingredientId}.json`,
      {
        method: 'DELETE',
      }
    )
      .then((res) => {
        dispatchHttp({ type: 'RESPONSE' });
        dispatchUser({ type: 'DELETE', id: ingredientId });
      })
      .catch((error) => {
        dispatchHttp({ type: 'ERROR', errorMessage: 'omething went wrong!' });
      });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: 'CLEAR' });
  }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userState}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userState, removeIngredientHandler]);

  return (
    <div className='App'>
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;

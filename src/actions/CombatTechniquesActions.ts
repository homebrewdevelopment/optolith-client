import { ADD_COMBATTECHNIQUE_POINT, REMOVE_COMBATTECHNIQUE_POINT, SET_COMBATTECHNIQUES_SORT_ORDER } from '../constants/ActionTypes';
import AppDispatcher from '../dispatcher/AppDispatcher';

export const addPoint = (id: string): void => AppDispatcher.dispatch(<AddCombatTechniquePointAction>{
	type: ADD_COMBATTECHNIQUE_POINT,
	payload: {
		id
	}
});

export const removePoint = (id: string): void => AppDispatcher.dispatch(<RemoveCombatTechniquePointAction>{
	type: REMOVE_COMBATTECHNIQUE_POINT,
	payload: {
		id
	}
});

export const setSortOrder = (sortOrder: string): void => AppDispatcher.dispatch(<SetCombatTechniquesSortOrderAction>{
	type: SET_COMBATTECHNIQUES_SORT_ORDER,
	payload: {
		sortOrder
	}
});

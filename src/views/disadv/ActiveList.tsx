import * as React from 'react';
import { ActivatableRemoveList } from '../../components/ActivatableRemoveList';
import { ActiveViewObject, DeactivateArgs, UIMessages } from '../../types/data.d';

interface Props {
	filterText: string;
	list: ActiveViewObject[];
	locale: UIMessages;
	rating: { [id: string]: string };
	showRating: boolean;
	removeFromList(args: DeactivateArgs): void;
	setTier(id: string, index: number, tier: number, cost: number): void;
}

export function ActiveList(props: Props) {
	return (
		<ActivatableRemoveList {...props} hideGroup />
	);
}
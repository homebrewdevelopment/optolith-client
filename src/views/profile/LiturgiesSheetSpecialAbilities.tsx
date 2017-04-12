import * as React from 'react';
import TextBox from '../../components/TextBox';
import * as Categories from '../../constants/Categories';
import * as ActivatableStore from '../../stores/ActivatableStore';
import ActivatableTextList from './ActivatableTextList';

export default () => (
	<TextBox label="Klerikale Sonderfertigkeiten" className="activatable-list">
		<ActivatableTextList list={ActivatableStore.getActiveForView(Categories.SPECIAL_ABILITIES).filter(e => [7].includes(e.gr!))} />
	</TextBox>
);
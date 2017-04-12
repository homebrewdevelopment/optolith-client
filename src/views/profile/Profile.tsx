import * as React from 'react';
import SubTabs from '../../components/SubTabs';
import PhaseStore from '../../stores/PhaseStore';
import OptionalRules from './OptionalRules';
import Overview from './Overview';
import Sheets from './Sheets';

interface ProfileState {
	phase: number;
	tab: string;
}

export default class Profile extends React.Component<undefined, ProfileState> {

	state = {
		phase: PhaseStore.get(),
		tab: 'overview',
	};

	_updatePhaseStore = () => this.setState({ phase: PhaseStore.get() } as ProfileState);

	handleClick = (tab: string) => this.setState({ tab } as ProfileState);

	componentDidMount() {
		PhaseStore.addChangeListener(this._updatePhaseStore );
	}

	componentWillUnmount() {
		PhaseStore.removeChangeListener(this._updatePhaseStore );
	}

	render() {

		const { phase, tab } = this.state;

		let element;

		switch (tab) {
			case 'overview':
				element = <Overview />;
				break;
			case 'sheets':
				element = <Sheets />;
				break;
			case 'optionalRules':
				element = <OptionalRules />;
				break;
		}

		const tabs = [
			{
				id: 'overview',
				label: 'Übersicht',
			},
		];

		if (phase === 3) {
			tabs.push({
				id: 'sheets',
				label: 'Heldenbogen',
			}, {
				id: 'optionalRules',
				label: 'Optionalregeln',
			});
		}

		return (
			<section id="profile">
				<SubTabs
					tabs={tabs}
					active={this.state.tab}
					onClick={this.handleClick} />
				{element}
			</section>
		);
	}
}
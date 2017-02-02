import Avatar from '../../components/Avatar';
import BorderButton from '../../components/BorderButton';
import CultureStore from '../../stores/CultureStore';
import HerolistActions from '../../_actions/HerolistActions';
import { get } from '../../stores/ListStore';
import ProfessionStore from '../../stores/ProfessionStore';
import ProfessionVariantStore from '../../stores/ProfessionVariantStore';
import ProfileStore from '../../stores/ProfileStore';
import ProgressArc from 'react-progress-arc';
import RaceStore from '../../stores/RaceStore';
import React, { PropTypes, Component } from 'react';
import TabActions from '../../_actions/TabActions';
import VerticalList from '../../components/VerticalList';
import classNames from 'classnames';

interface Props {
	ap: {
		total: number;
	};
	avatar: string;
	c: string;
	el: string;
	id: string | null;
	name: string;
	p: string;
	player?: User;
	pv: string | null;
	r: string;
	sex: string;
}

export default class HerolistItem extends Component<Props, undefined> {

	load = () => HerolistActions.load(this.props.id);
	show = () => TabActions.showSection('hero');

	render() {

		const { player, id, name, avatar, ap: { total: apTotal }, r, c, p, pv, sex } = this.props;

		const elRoman = [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII' ];
		const elAp = [ 900, 1000, 1100, 1200, 1400, 1700, 2100 ];

		var currentEL = 6;

		for (let i = 0; i < elAp.length; i++) {
			if (elAp[i] === apTotal) {
				currentEL = i;
				break;
			} else if (elAp[i] > apTotal) {
				currentEL = i - 1;
				break;
			}
		}

		var elProgress = currentEL === 6 ? 1 : ((apTotal - elAp[currentEL]) / (elAp[currentEL + 1] - elAp[currentEL]));

		const playerElement = player ? (
			<span className="player">{player.displayName}</span>
		) : null;

		const rcpElement = id !== null ? (
			<VerticalList className="rcp">
				<span className="race">
					{(() => {
						const { name } = get(r) || { name: 'Loading...' };
						return name;
					})()}
				</span>
				<span className="culture">
					{(() => {
						const { name } = get(c) || { name: 'Loading...' };
						return name;
					})()}
				</span>
				<span className="profession">
					{(() => {
						let { name, subname } = get(p) || { name: 'Loading...', subname: undefined };
						if (typeof name === 'object') {
							name = name[sex];
						}
						if (typeof subname === 'object') {
							subname = subname[sex];
						}
						let { name: vname } = get(pv) || { name: 'Loading...' };
						if (typeof vname === 'object') {
							vname = vname[sex];
						}
						return name + (subname ? ` (${subname})` : pv ? ` (${vname})` : '');
					})()}
				</span>
			</VerticalList>
		) : null;

		return (
			<li className="hero-list-item">
				<ProgressArc completed={elProgress} diameter={63} strokeWidth={4} />
				<div className={classNames( 'el avatar-wrapper', !avatar && 'no-avatar' )}>
					<div className="el-value">
						<h2>{elRoman[currentEL]}</h2>
					</div>
					<Avatar src={avatar} />
				</div>
				<div className="main">
					<h2>{name}{playerElement}</h2>
					{rcpElement}
				</div>
				{(() => id === ProfileStore.getID() ? (
					<BorderButton label="Anzeigen" onClick={this.show} primary />
				) : (
					<BorderButton label="Öffnen" onClick={this.load} />
				))()}
			</li>
		);
	}
}

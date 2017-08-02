import * as React from 'react';
import { Dropdown } from '../../components/Dropdown';
import { IconButton } from '../../components/IconButton';
import { InputButtonGroup } from '../../components/InputButtonGroup';
import { TextField } from '../../components/TextField';
import { ProfileState } from '../../reducers/profile';
import { CultureInstance, InputTextEvent, RaceInstance } from '../../types/data.d';
import { UIMessages } from '../../types/ui.d';
import { sort } from '../../utils/FilterSortUtils';
import { _translate } from '../../utils/I18n';

export interface OverviewPersonalDataOwnProps {
	culture: CultureInstance | undefined;
	eyecolorTags: string[];
	haircolorTags: string[];
	locale: UIMessages;
	profile: ProfileState;
	race: RaceInstance | undefined;
	socialstatusTags: string[];
}

export interface OverviewPersonalDataDispatchProps {
	changeFamily(event: InputTextEvent): void;
	changePlaceOfBirth(event: InputTextEvent): void;
	changeDateOfBirth(event: InputTextEvent): void;
	changeAge(event: InputTextEvent): void;
	changeHaircolor(result: number): void;
	changeEyecolor(result: number): void;
	changeSize(event: InputTextEvent): void;
	changeWeight(event: InputTextEvent): void;
	changeTitle(event: InputTextEvent): void;
	changeSocialStatus(result: number): void;
	changeCharacteristics(event: InputTextEvent): void;
	changeOtherInfo(event: InputTextEvent): void;
	changeCultureAreaKnowledge(event: InputTextEvent): void;
	rerollHair(): void;
	rerollEyes(): void;
	rerollSize(): void;
	rerollWeight(): void;
}

export type OverviewPersonalDataProps = OverviewPersonalDataDispatchProps & OverviewPersonalDataOwnProps;

export function OverviewPersonalData(props: OverviewPersonalDataProps) {
	const {
		culture,
		eyecolorTags,
		haircolorTags,
		locale,
		profile: {
			age = '',
			characteristics = '',
			cultureAreaKnowledge,
			eyecolor,
			dateofbirth = '',
			family = '',
			haircolor,
			otherinfo = '',
			placeofbirth = '',
			size = '',
			socialstatus,
			title = '',
			weight = ''
		},
		race,
		socialstatusTags
	} = props;

	const hairArr = race ? sort(haircolorTags.map((name, i) => ({ id: i + 1, name })).filter(e => race.hairColors.includes(e.id))) : [];
	const eyesArr = race ? sort(eyecolorTags.map((name, i) => ({ id: i + 1, name })).filter(e => race.eyeColors.includes(e.id))) : [];
	const socialArr = culture ? socialstatusTags.map((name, i) => ({ id: i + 1, name })).filter(e => culture.socialTiers.includes(e.id)) : [];

	return (
		<div className="personal-data">
			<div>
				<TextField
					label={_translate(locale, 'personaldata.family')}
					value={family}
					onChange={props.changeFamily}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.placeofbirth')}
					value={placeofbirth}
					onChange={props.changePlaceOfBirth}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.dateofbirth')}
					value={dateofbirth}
					onChange={props.changeDateOfBirth}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.age')}
					value={age}
					onChange={props.changeAge}
					/>
			</div>
			<InputButtonGroup className="reroll">
				<Dropdown
					label={_translate(locale, 'personaldata.haircolor')}
					value={haircolor}
					onChange={props.changeHaircolor}
					options={hairArr}
					/>
				<IconButton icon="&#xEB40;" onClick={props.rerollHair} />
			</InputButtonGroup>
			<InputButtonGroup className="reroll">
				<Dropdown
					label={_translate(locale, 'personaldata.eyecolor')}
					value={eyecolor}
					onChange={props.changeEyecolor}
					options={eyesArr}
					/>
				<IconButton icon="&#xEB40;" onClick={props.rerollEyes} />
			</InputButtonGroup>
			<InputButtonGroup className="reroll">
				<TextField
					label={_translate(locale, 'personaldata.size')}
					value={size}
					onChange={props.changeSize}
					/>
				<IconButton icon="&#xEB40;" onClick={props.rerollSize} />
			</InputButtonGroup>
			<InputButtonGroup className="reroll">
				<TextField
					label={_translate(locale, 'personaldata.weight')}
					value={weight}
					onChange={props.changeWeight}
					/>
				<IconButton icon="&#xEB40;" onClick={props.rerollWeight} />
			</InputButtonGroup>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.title')}
					value={title}
					onChange={props.changeTitle}
					/>
			</div>
			<div>
				<Dropdown
					label={_translate(locale, 'personaldata.socialstatus')}
					value={socialstatus}
					onChange={props.changeSocialStatus}
					options={socialArr}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.characteristics')}
					value={characteristics}
					onChange={props.changeCharacteristics}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.otherinfo')}
					value={otherinfo}
					onChange={props.changeOtherInfo}
					/>
			</div>
			<div>
				<TextField
					label={_translate(locale, 'personaldata.cultureareaknowledge')}
					value={cultureAreaKnowledge}
					onChange={props.changeCultureAreaKnowledge}
					/>
			</div>
		</div>
	);
}

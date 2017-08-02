import * as React from 'react';
import { RaceInstance, SecondaryAttribute } from '../../types/data.d';
import { _translate, UIMessages } from '../../utils/I18n';
import { MainSheetAttributesItem } from './MainSheetAttributesItem';
import { MainSheetFatePoints } from './MainSheetFatePoints';

export interface MainSheetAttributesProps {
	attributes: SecondaryAttribute[];
	fatePointsModifier: number;
	locale: UIMessages;
	race: RaceInstance | undefined;
}

export function MainSheetAttributes(props: MainSheetAttributesProps) {
	const { attributes, fatePointsModifier, race, locale } = props;
	return (
		<div className="calculated">
			<div className="calc-header">
				<div>{_translate(locale, 'charactersheet.main.headers.value')}</div>
				<div>{_translate(locale, 'charactersheet.main.headers.bonuspenalty')}</div>
				<div>{_translate(locale, 'charactersheet.main.headers.bought')}</div>
				<div>{_translate(locale, 'charactersheet.main.headers.max')}</div>
			</div>
			<MainSheetAttributesItem
				label={attributes[0].name}
				calc={attributes[0].calc}
				base={attributes[0].base}
				max={attributes[0].value}
				add={attributes[0].mod}
				purchased={attributes[0].currentAdd}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.basestat')}
				subArray={[race ? race.lp : 0]}
				/>
			<MainSheetAttributesItem
				label={attributes[1].name}
				calc={attributes[1].calc}
				base={attributes[1].base}
				max={attributes[1].value}
				add={attributes[1].mod}
				purchased={attributes[1].currentAdd}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.permanent')}
				subArray={[attributes[1].permanentLost!, attributes[1].permanentRedeemed!]}
				empty={attributes[1].value === '-'}
				/>
			<MainSheetAttributesItem
				label={attributes[2].name}
				calc={attributes[2].calc}
				base={attributes[2].base}
				max={attributes[2].value}
				add={attributes[2].mod}
				purchased={attributes[2].currentAdd}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.permanent')}
				subArray={[attributes[2].permanentLost!, attributes[2].permanentRedeemed!]}
				empty={typeof attributes[2].value === 'string'}
				/>
			<MainSheetAttributesItem
				label={attributes[3].name}
				calc={attributes[3].calc}
				base={attributes[3].base}
				max={attributes[3].value}
				add={attributes[3].mod}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.basestat')}
				subArray={[race ? race.spi : 0]}
				/>
			<MainSheetAttributesItem
				label={attributes[4].name}
				calc={attributes[4].calc}
				base={attributes[4].base}
				max={attributes[4].value}
				add={attributes[4].mod}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.basestat')}
				subArray={[race ? race.tou : 0]}
				/>
			<MainSheetAttributesItem
				label={attributes[5].name}
				calc={attributes[5].calc}
				base={attributes[5].base}
				max={attributes[5].value}
				/>
			<MainSheetAttributesItem
				label={attributes[6].name}
				calc={attributes[6].calc}
				base={attributes[6].base}
				max={attributes[6].value}
				/>
			<MainSheetAttributesItem
				label={attributes[7].name}
				calc={attributes[7].calc}
				base={attributes[7].base}
				max={attributes[7].value}
				add={attributes[7].mod}
				subLabel={_translate(locale, 'charactersheet.main.subheaders.basestat')}
				subArray={[race ? race.mov : 0]}
				/>
			<MainSheetFatePoints
				fatePointsModifier={fatePointsModifier}
				locale={locale}
				/>
		</div>
	);
}

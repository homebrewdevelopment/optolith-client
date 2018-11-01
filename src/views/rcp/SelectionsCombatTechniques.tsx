import * as React from 'react';
import { Checkbox } from '../../components/Checkbox';
import { CombatTechnique } from '../../types/wiki';
import { List, Maybe, OrderedSet, Record } from '../../utils/dataUtils';
import { translate, UIMessagesObject } from '../../utils/I18n';

export interface SelectionsCombatTechniquesProps {
  active: OrderedSet<string>;
  disabled?: OrderedSet<string>;
  amount: number;
  list: List<Record<CombatTechnique>>;
  locale: UIMessagesObject;
  value: number;
  second?: boolean;
  change (id: string): void;
}

export function SelectionsCombatTechniques (props: SelectionsCombatTechniquesProps) {
  const { active, amount, change, disabled, list, locale, value, second } = props;

  const amountTags = List.of (
    translate (locale, 'rcpselections.labels.one'),
    translate (locale, 'rcpselections.labels.two')
  );

  const text =
    second
      ? translate (locale, 'rcpselections.labels.more')
      : translate (locale, 'rcpselections.labels.ofthefollowingcombattechniques');

  return (
    <div className="ct list">
      <h4>{Maybe.fromMaybe ('') (amountTags .subscript (amount - 1))} {text} {value + 6}</h4>
      {
        list
          .map (obj => {
            const id = obj .get ('id');
            const name = obj .get ('name');

            return (
              <Checkbox
                key={id}
                checked={active .member (id)}
                disabled={
                  active.notMember (id) && active .size () >= amount
                  || disabled && disabled.member (id)
                }
                label={name}
                onClick={() => change (id)} />
            );
          })
          .toArray ()
      }
    </div>
  );
}

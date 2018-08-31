import R from 'ramda';
import { IdPrefixes } from '../constants/IdPrefixes';
import * as Data from '../types/data';
import * as Wiki from '../types/wiki';
import { isActivatableDependent, isActivatableSkillDependent, isDependentSkillExtended } from './checkEntryUtils';
import * as CheckPrerequisiteUtils from './checkPrerequisiteUtils';
import { Just, List, Maybe, OrderedMap, Record, Tuple } from './dataUtils';
import { getHeroStateListItem } from './heroStateUtils';
import { isActive } from './isActive';
import { isPactValid as isPactFromStateValid } from './pactUtils';
import { getPrimaryAttributeId } from './primaryAttributeUtils';
import { getActiveSelections } from './selectionUtils';
import { getAllWikiEntriesByGroup } from './WikiUtils';

interface Validator {
  (
    wiki: Record<Wiki.WikiAll>,
    state: Record<Data.HeroDependent>,
    req: Wiki.AllRequirements,
    sourceId: string,
  ): boolean;
}

const getAllRaceEntries = (
  wiki: Record<Wiki.WikiAll>, state: Record<Data.HeroDependent>
) =>
  state.lookup ('race')
    .bind (wiki.get ('races').lookup)
    .fmap (race => race.get ('stronglyRecommendedAdvantages')
      .mappend (race.get ('automaticAdvantages'))
      .mappend (race.get ('stronglyRecommendedAdvantages'))
      .mappend (race.get ('stronglyRecommendedDisadvantages'))
      .mappend (race.get ('commonAdvantages'))
      .mappend (race.get ('commonDisadvantages'))
    );

const getAllCultureEntries = (
  wiki: Record<Wiki.WikiAll>, state: Record<Data.HeroDependent>
) =>
  state.lookup ('culture')
    .bind (wiki.get ('cultures').lookup)
    .fmap (culture => culture.get ('commonAdvantages')
      .mappend (culture.get ('commonDisadvantages'))
    );

const getAllProfessionEntries = (
  wiki: Record<Wiki.WikiAll>, state: Record<Data.HeroDependent>
) =>
  state.lookup ('profession')
    .bind (wiki.get ('professions').lookup)
    .fmap (profession => profession.get ('suggestedAdvantages')
      .mappend (profession.get ('unsuitableAdvantages'))
    );

const isRCPValid = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  sourceId: string,
): boolean =>
  Maybe.catMaybes (
    List.of (
      getAllRaceEntries (wiki, state),
      getAllCultureEntries (wiki, state),
      getAllProfessionEntries (wiki, state),
    )
  )
    .map (List.elem (sourceId))
    .or ();

const isSexValid = (
  sex: Just<'m' | 'f'>,
  req: Record<Wiki.SexRequirement>
): boolean =>
  req.lookup ('value').equals (sex);

const isRaceValid = (
  race: Maybe<string>,
  req: Record<Wiki.RaceRequirement>
): boolean => {
  const value = req.get ('value');

  if (value instanceof List) {
    return Maybe.isJust (race) &&
      value.map (e => `${IdPrefixes.RACES}_${e}`)
        .elem (Maybe.fromJust (race))
  }
  else {
    return race.equals (Maybe.pure (`${IdPrefixes.RACES}_${value}`));
  }
};

const isCultureValid = (
  culture: Maybe<string>,
  req: Record<Wiki.CultureRequirement>,
): boolean => {
  const value = req.get ('value');

  if (value instanceof List) {
    return Maybe.isJust (culture) &&
      value.map (e => `${IdPrefixes.CULTURES}_${e}`)
        .elem (Maybe.fromJust (culture))
  }
  else {
    return culture.equals (Maybe.pure (`${IdPrefixes.CULTURES}_${value}`));
  }
};

const hasSamePactCategory = (
  state: Record<Data.Pact>,
  req: Record<Wiki.PactRequirement>,
) => req.lookup ('category').equals (state.lookup ('category'));

const hasNeededPactType = (
  state: Record<Data.Pact>,
  req: Record<Wiki.PactRequirement>,
) => {
  switch (req.get ('category')) {
    case 1:
      return state.lookup ('type').equals (Maybe.pure (3));
    default:
      return true;
  }
};

const hasNeededPactDomain = (
  state: Record<Data.Pact>,
  req: Record<Wiki.PactRequirement>,
) => {
  const reqDomainMaybe = req.lookup ('domain');
  const stateDomainMaybe = state.lookup ('domain');

  if (!Maybe.isJust (reqDomainMaybe)) {
    return true;
  }

  if (state.lookup ('domain').fmap (e => typeof e !== 'number')) {
    return false;
  }

  if (!Maybe.isJust (stateDomainMaybe)) {
    return false;
  }

  const reqDomain = Maybe.fromJust (reqDomainMaybe);
  const stateDomain = Maybe.fromJust (stateDomainMaybe);

  if (typeof reqDomain === 'object') {
    return Maybe.isJust (stateDomainMaybe) &&
      reqDomain.elem (stateDomain as number);
  }

  return reqDomain === stateDomain;
};

const hasNeededPactLevel = (
  state: Record<Data.Pact>,
  req: Record<Wiki.PactRequirement>,
) =>
  Maybe.isNothing (req.lookup ('level')) ||
  req.lookup ('level').lte (state.lookup ('level'));

const isPactValid = (
  pact: Maybe<Record<Data.Pact>>,
  req: Record<Wiki.PactRequirement>,
): boolean => {
  if (Maybe.isJust (pact)) {
    const just = Maybe.fromJust (pact);

    return isPactFromStateValid (just)
      && hasSamePactCategory (just, req)
      && hasNeededPactType (just, req)
      && hasNeededPactDomain (just, req)
      && hasNeededPactLevel (just, req);
  }
  else {
    return false;
  }
};

const isPrimaryAttributeValid = (
  state: Record<Data.HeroDependent>,
  req: Record<Wiki.RequiresPrimaryAttribute>,
): boolean => {
  return Maybe.fromMaybe (false) (
    state.lookup ('specialAbilities').bind (
      specialAbilities => getPrimaryAttributeId (
        specialAbilities,
        req.get ('type')
      )
        .fmap (id =>
          state.lookup ('attributes')
            .bind (e => e.lookup (id))
            .bind (e => e.lookup ('value'))
            .equals (req.lookup ('value'))
        )
    )
  );
};

const isIncreasableValid = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  sourceId: string,
  req: Record<Wiki.RequiresIncreasableObject>,
  objectValidator: Validator,
): boolean => {
  const id = req.get ('id');

  if (id instanceof List) {
    return id.any (e =>
      objectValidator (wiki, state, req.insert ('id') (e), sourceId)
    );
  }
  else {
    return Maybe.fromMaybe (false) (
      getHeroStateListItem (id) (state)
        .fmap (
          instance => isDependentSkillExtended (instance) &&
          instance.lookup ('value').gte (req.lookup ('value'))
        )
    );
  }
};

const isOneOfListActiveSelection = (
  activeSelections: Maybe<List<string | number>>,
  req: Record<Wiki.RequiresActivatableObject>,
  sid: List<number>
): boolean =>
  req.lookup ('active')
    .equals (activeSelections.fmap (list => sid.any (list.elem)));

const isSingleActiveSelection = (
  activeSelections: Maybe<List<string | number>>,
  req: Record<Wiki.RequiresActivatableObject>,
  sid: string | number
): boolean =>
  req.lookup ('active')
    .equals (activeSelections.fmap (list => list.elem (sid)));

const isActiveSelection = (
  activeSelections: Maybe<List<string | number>>,
  req: Record<Wiki.RequiresActivatableObject>,
  sid: Wiki.SID
): boolean =>
  sid instanceof List
    ? isOneOfListActiveSelection (activeSelections, req, sid)
    : isSingleActiveSelection (activeSelections, req, sid);

const isNeededLevelGiven = (
  instance: Record<Data.ActivatableDependent>,
  tier: number
): boolean =>
  instance.get ('active').any (e =>
    Maybe.fromMaybe (false) (e.lookup ('tier').fmap (R.lte (tier)))
  );

const isActivatableValid = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  sourceId: string,
  req: Record<Wiki.RequiresActivatableObject>,
  objectValidator: Validator,
): boolean => {
  const id = req.get ('id');

  if (id instanceof List) {
    return id.any (e =>
      objectValidator (wiki, state, req.insert ('id') (e), sourceId)
    );
  }
  else {
    const sid = req.lookup ('sid');

    if (sid.equals (Maybe.pure ('sel'))) {
      return true;
    }
    else if (sid.equals (Maybe.pure ('GR'))) {
      return Maybe.fromMaybe (true) (
        getHeroStateListItem<Record<Data.ActivatableDependent>> (id) (state)
          .bind (target => {
            const arr = getAllWikiEntriesByGroup (
              wiki.get ('skills'),
              ...Maybe.maybeToList (req.lookup ('sid2') as Maybe<number>)
            )
              .map (e => e.get ('id'));

            return getActiveSelections (Maybe.pure (target))
              .fmap (list => list.all (e =>
                !arr.elem (e as string)
              ));
          })
      );
    }
    else {
      const maybeInstance =
        getHeroStateListItem<Data.ExtendedActivatableDependent> (id) (state);

      if (isActivatableDependent (maybeInstance)) {
        const instance = Maybe.fromJust (maybeInstance);
        const activeSelections = getActiveSelections (maybeInstance);

        const maybeSid = req.lookup ('sid');
        const maybeTier = req.lookup ('tier');

        if (Maybe.isJust (maybeSid) && Maybe.isJust (maybeTier)) {
          const justSid = Maybe.fromJust (maybeSid);
          const justTier = Maybe.fromJust (maybeTier);

          return isActiveSelection (activeSelections, req, justSid) &&
            isNeededLevelGiven (instance, justTier);
        }
        else if (Maybe.isJust (maybeSid)) {
          const justSid = Maybe.fromJust (maybeSid);

          return isActiveSelection (activeSelections, req, justSid);
        }
        else if (Maybe.isJust (maybeTier)) {
          const tier = Maybe.fromJust (maybeTier);

          return isNeededLevelGiven (instance, tier);
        }
        else {
          return isActive (instance) === req.get ('active');
        }
      }
      else if (isActivatableSkillDependent (maybeInstance)) {
        return maybeInstance
          .bind (e => e.lookup ('active'))
          .equals (req.lookup ('active'));
      }
      else {
        return false;
      }
    }
  }
};

/**
 * Checks if the requirement is fulfilled.
 * @param state The current hero data.
 * @param req A requirement object.
 * @param sourceId The id of the entry the requirement object belongs to.
 * @param pact A valid `Pact` object or `undefined`.
 */
export const validateObject = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  req: Wiki.AllRequirements,
  sourceId: string,
): boolean => {
  if (req === 'RCP') {
    return isRCPValid (wiki, state, sourceId);
  }
  else if (CheckPrerequisiteUtils.isSexRequirement (req)) {
    return isSexValid (state.lookup ('sex'), req);
  }
  else if (CheckPrerequisiteUtils.isRaceRequirement (req)) {
    return isRaceValid (state.lookup ('race'), req);
  }
  else if (CheckPrerequisiteUtils.isCultureRequirement (req)) {
    return isCultureValid (state.lookup ('culture'), req);
  }
  else if (CheckPrerequisiteUtils.isPactRequirement (req)) {
    return isPactValid (state.lookup ('pact'), req);
  }
  else if (CheckPrerequisiteUtils.isRequiringPrimaryAttribute (req)) {
    return isPrimaryAttributeValid (state, req);
  }
  else if (CheckPrerequisiteUtils.isRequiringIncreasable (req)) {
    return isIncreasableValid (wiki, state, sourceId, req, validateObject);
  }
  else {
    return isActivatableValid (wiki, state, sourceId, req, validateObject);
  }
};

/**
 * Checks if all requirements are fulfilled.
 * @param state The current hero data.
 * @param requirements An array of requirement objects.
 * @param sourceId The id of the entry the requirement objects belong to.
 * @param pact A valid `Pact` object or `undefined`.
 */
export const validatePrerequisites = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  requirements: List<Wiki.AllRequirements>,
  sourceId: string,
): boolean => {
  return requirements.all (e => validateObject (wiki, state, e, sourceId));
}

type ReqEntries = List<Tuple<number, List<Wiki.AllRequirements>>>;

const isSkipping = (arr: ReqEntries, index: number, max: Maybe<number>) =>
  Maybe.isJust (max) &&
    index > 1 &&
    arr.subscript (index - 2).fmap (Tuple.fst).lt (max);

const areAllPrerequisitesValid = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  prerequisites: List<Wiki.AllRequirements>,
  sourceId: string,
) => prerequisites.all (e => {
  return validateObject (wiki, state, e, sourceId);
});

/**
 * Get maximum valid tier.
 * @param state The current hero data.
 * @param requirements A Map of tier prereqisite arrays.
 * @param sourceId The id of the entry the requirement objects belong to.
 */
export const validateTier = (
  wiki: Record<Wiki.WikiAll>,
  state: Record<Data.HeroDependent>,
  requirements: OrderedMap<number, List<Wiki.AllRequirements>>,
  dependencies: List<Data.ActivatableDependency>,
  sourceId: string,
): Maybe<number> => {
  return dependencies.foldl<Maybe<number>> (
    max => dep =>
      // If `dep` prohibits higher level
      typeof dep === 'object' &&
      dep.lookup ('active').equals (Maybe.pure (false)) &&
      Maybe.isJust (dep.lookup ('tier'))
        ? Maybe.pure (
            Maybe.catMaybes (
              List.of (max, dep.lookup ('tier').fmap (e => e - 1))
            ).minimum ()
          )
        : max
  ) (
    OrderedMap.toList (requirements)
      .sortBy (a => b => Tuple.fst (a) - Tuple.fst (b))
      .ifoldlWithList<Maybe<number>> (
        list => acc => index => entry =>
          (
            !isSkipping (list, index, acc)
            || areAllPrerequisitesValid (wiki, state, Tuple.snd (entry), sourceId)
          )
            ? Maybe.pure (Tuple.fst (entry))
            : acc
      ) (Maybe.empty ())
  );
};

/**
 * Checks if all profession prerequisites are fulfilled.
 * @param prerequisites An array of prerequisite objects.
 */
export function validateProfession (
  prerequisites: List<Wiki.ProfessionDependency>,
  sex: 'm' | 'f',
  race: Maybe<string>,
  culture: Maybe<string>,
): boolean {
  return prerequisites.all (req => {
    if (CheckPrerequisiteUtils.isSexRequirement (req)) {
      return isSexValid (Maybe.pure (sex), req);
    }
    else if (CheckPrerequisiteUtils.isRaceRequirement (req)) {
      return isRaceValid (race, req);
    }
    else if (CheckPrerequisiteUtils.isCultureRequirement (req)) {
      return isCultureValid (culture, req);
    }
    else {
      return false;
    }
  });
}
import * as R from 'ramda';
import * as React from 'react';
import { ItemInstance, Purse } from '../../App/Models/Hero/heroTypeHelpers';
import { CombatTechniqueWithRequirements } from '../../App/Models/View/viewTypeHelpers';
import { ItemTemplate } from '../../App/Models/Wiki/wikiTypeHelpers';
import { translate, UIMessagesObject } from '../../App/Utils/I18n';
import { Aside } from '../../components/Aside';
import { BorderButton } from '../../components/BorderButton';
import { Dropdown, DropdownOption } from '../../components/Dropdown';
import { ListView } from '../../components/List';
import { ListHeader } from '../../components/ListHeader';
import { ListHeaderTag } from '../../components/ListHeaderTag';
import { ListPlaceholder } from '../../components/ListPlaceholder';
import { MainContent } from '../../components/MainContent';
import { Options } from '../../components/Options';
import { Page } from '../../components/Page';
import { Scroll } from '../../components/Scroll';
import { Slidein } from '../../components/Slidein';
import { SortNames, SortOptions } from '../../components/SortOptions';
import { TextField } from '../../components/TextField';
import { ItemEditorContainer } from '../../containers/ItemEditorContainer';
import { WikiInfoContainer } from '../../containers/WikiInfoContainer';
import { Just, List, Maybe, Nothing, Record } from '../../utils/dataUtils';
import { sortObjects } from '../../utils/FilterSortUtils';
import { EquipmentListItem } from './EquipmentListItem';
import { PurseAndTotals } from './PurseAndTotals';

export interface EquipmentOwnProps {
  locale: UIMessagesObject;
}

export interface EquipmentStateProps {
  combatTechniques: Maybe<List<Record<CombatTechniqueWithRequirements>>>;
  carryingCapacity: Maybe<number>;
  initialStartingWealth: number;
  items: Maybe<List<Record<ItemInstance>>>;
  hasNoAddedAP: boolean;
  purse: Maybe<Record<Purse>>;
  sortOrder: string;
  templates: Maybe<List<Record<ItemTemplate>>>;
  totalPrice: Maybe<number>;
  totalWeight: Maybe<number>;
  meleeItemTemplateCombatTechniqueFilter: Maybe<string>;
  rangedItemTemplateCombatTechniqueFilter: Maybe<string>;
  filterText: string;
  templatesFilterText: string;
}

export interface EquipmentDispatchProps {
  setSortOrder (option: string): void;
  setDucates (value: string): void;
  setSilverthalers (value: string): void;
  setHellers (value: string): void;
  setKreutzers (value: string): void;
  addTemplateToList (id: string): void;
  createItem (): void;
  deleteItem (id: string): void;
  editItem (id: string): void;
  setMeleeItemTemplatesCombatTechniqueFilter (filterOption: Maybe<string>): void;
  setRangedItemTemplatesCombatTechniqueFilter (filterOption: Maybe<string>): void;
  setFilterText (filterText: string): void;
  setTemplatesFilterText (filterText: string): void;
}

export type EquipmentProps = EquipmentStateProps & EquipmentDispatchProps & EquipmentOwnProps;

export interface EquipmentState {
  filterGroupSlidein: number;
  showAddSlidein: boolean;
  currentId: Maybe<string>;
  currentSlideinId: Maybe<string>;
}

const prepareCombatTechniquesForSelection = (gr: number) => R.pipe (
  Maybe.fmap (
    List.filter<Record<CombatTechniqueWithRequirements>> (e => e .get ('gr') === gr)
  ),
  Maybe.fromMaybe (List.empty ()) as unknown as
    (x: Maybe<List<Record<CombatTechniqueWithRequirements>>>) => List<Record<DropdownOption>>
);

export class Equipment extends React.Component<EquipmentProps, EquipmentState> {
  state = {
    filterGroupSlidein: 1,
    showAddSlidein: false,
    currentId: Nothing (),
    currentSlideinId: Nothing (),
  };

  filterGroupSlidein = (gr: Maybe<number>) => {
    if (Maybe.isJust (gr)) {
      this.setState ({ filterGroupSlidein: Maybe.fromJust (gr) });
    }
  };
  showInfo = (id: string) => this.setState ({ currentId: Just (id) });
  showSlideinInfo = (id: string) => this.setState ({ currentSlideinId: Just (id) });

  showAddSlidein = () => this.setState ({ showAddSlidein: true });
  hideAddSlidein = () => this.setState ({ showAddSlidein: false });

  render () {
    const {
      combatTechniques: maybeCombatTechniques,
      items: maybeItems,
      locale,
      sortOrder,
      templates,
      meleeItemTemplateCombatTechniqueFilter,
      rangedItemTemplateCombatTechniqueFilter,
      setMeleeItemTemplatesCombatTechniqueFilter,
      setRangedItemTemplatesCombatTechniqueFilter,
      filterText,
      templatesFilterText,
    } = this.props;

    const { filterGroupSlidein, showAddSlidein } = this.state;

    const groups = translate (locale, 'equipment.view.groups');

    const groupsSelectionItems =
      sortObjects (
        groups .imap (index => e  => Record.of<DropdownOption> ({ id: index + 1, name: e })),
        locale .get ('id')
      );

    const getHasValidCombatTechnique = (e: Record<ItemTemplate>) =>
      Maybe.isJust (meleeItemTemplateCombatTechniqueFilter) && e .get ('gr') === 1
        ? Maybe.elem
          (Maybe.fromJust (meleeItemTemplateCombatTechniqueFilter))
          (e .lookup ('combatTechnique'))
        : Maybe.isJust (rangedItemTemplateCombatTechniqueFilter) && e .get ('gr') === 2
        ? Maybe.elem
          (Maybe.fromJust (rangedItemTemplateCombatTechniqueFilter))
          (e .lookup ('combatTechnique'))
        : true;

    const filterTemplatesByIsActive = (e: Record<ItemTemplate>): boolean =>
      Maybe.elem
        (false)
        (maybeItems .fmap (
          R.pipe (
            List.find (
              item => Maybe.elem (e .get ('template')) (item .lookup ('template'))
                && item .get ('isTemplateLocked')
            ),
            Maybe.isJust
          )
        ));

    const filterTemplatesByIsActiveAndInGroup = (e: Record<ItemTemplate>): boolean => {
      const isGroup = e .get ('gr') === filterGroupSlidein;
      const hasValidCombatTechnique = getHasValidCombatTechnique (e);
      const isNotInList = filterTemplatesByIsActive (e);

      return isGroup && hasValidCombatTechnique && isNotInList;
    };

    const meleeCombatTechniques = prepareCombatTechniquesForSelection (1) (maybeCombatTechniques);
    const rangedCombatTechniques = prepareCombatTechniquesForSelection (2) (maybeCombatTechniques);

    const templateList =
      templatesFilterText.length === 0
        ? templates .fmap (List.filter (filterTemplatesByIsActiveAndInGroup))
        : templates .fmap (List.filter (filterTemplatesByIsActive));

    return (
      <Page id="equipment">
        <Slidein isOpened={showAddSlidein} close={this.hideAddSlidein}>
          <Options>
            <TextField
              hint={translate (locale, 'options.filtertext')}
              value={templatesFilterText}
              onChangeString={this.props.setTemplatesFilterText}
              fullWidth
              />
            <Dropdown
              value={Just (filterGroupSlidein)}
              onChange={this.filterGroupSlidein}
              options={groupsSelectionItems}
              fullWidth
              />
            {filterGroupSlidein === 1 && <Dropdown
              value={meleeItemTemplateCombatTechniqueFilter}
              onChange={setMeleeItemTemplatesCombatTechniqueFilter}
              options={
                meleeCombatTechniques .cons (Record.of<DropdownOption> ({
                  name: translate (locale, 'allcombattechniques'),
                }))
              }
              fullWidth
              />}
            {filterGroupSlidein === 2 && <Dropdown
              value={rangedItemTemplateCombatTechniqueFilter}
              onChange={setRangedItemTemplatesCombatTechniqueFilter}
              options={
                rangedCombatTechniques .cons (Record.of<DropdownOption> ({
                  name: translate (locale, 'allcombattechniques'),
                }))
              }
              fullWidth
              />}
          </Options>
          <MainContent>
            <ListHeader>
              <ListHeaderTag className="name">
                {translate (locale, 'name')}
              </ListHeaderTag>
              <ListHeaderTag className="btn-placeholder" />
            </ListHeader>
            <Scroll>
              <ListView>
                {
                  Maybe.fromMaybe<NonNullable<React.ReactNode>>
                    (<ListPlaceholder locale={locale} type="itemTemplates" noResults />)
                    (templateList
                      .bind (Maybe.ensure (R.pipe (List.null, R.not)))
                      .fmap (R.pipe (
                        List.map (
                          obj => (
                            <EquipmentListItem
                              {...this.props}
                              key={obj .get ('id')}
                              data={obj}
                              selectForInfo={this.showSlideinInfo}
                              add
                              />
                          )
                        ),
                        List.toArray
                      )))
                }
              </ListView>
            </Scroll>
          </MainContent>
          <WikiInfoContainer {...this.props} currentId={this.state.currentSlideinId} />
        </Slidein>
        <Options>
          <TextField
            hint={translate (locale, 'options.filtertext')}
            value={filterText}
            onChangeString={this.props.setFilterText}
            fullWidth
            />
          <SortOptions
            options={List.of<SortNames> ('name', 'groupname', 'where', 'weight')}
            sortOrder={sortOrder}
            sort={this.props.setSortOrder}
            locale={locale}
            />
          <BorderButton
            label={translate (locale, 'actions.addtolist')}
            onClick={this.showAddSlidein}
            />
          <BorderButton
            label={translate (locale, 'equipment.actions.create')}
            onClick={this.props.createItem}
            />
        </Options>
        <MainContent>
          <ListHeader>
            <ListHeaderTag className="name">
              {translate (locale, 'name')}
            </ListHeaderTag>
            <ListHeaderTag className="group">
              {translate (locale, 'group')}
              </ListHeaderTag>
            <ListHeaderTag className="btn-placeholder" />
            <ListHeaderTag className="btn-placeholder" />
            <ListHeaderTag className="btn-placeholder" />
          </ListHeader>
          <Scroll>
            <ListView>
              {
                Maybe.fromMaybe<NonNullable<React.ReactNode>>
                  (
                    <ListPlaceholder
                      locale={locale}
                      type="equipment"
                      noResults={filterText.length > 0}
                      />
                  )
                  (maybeItems
                    .bind (Maybe.ensure (R.pipe (List.null, R.not)))
                    .fmap (R.pipe (
                      List.map (
                        obj => (
                          <EquipmentListItem
                            {...this.props}
                            key={obj .get ('id')}
                            data={obj}
                            selectForInfo={this.showInfo}
                            />
                        )
                      ),
                      List.toArray
                    )))
              }
            </ListView>
          </Scroll>
        </MainContent>
        <Aside>
          <PurseAndTotals {...this.props} />
          <WikiInfoContainer {...this.props} {...this.state} noWrapper />
        </Aside>
        <ItemEditorContainer locale={locale} />
      </Page>
    );
  }
}

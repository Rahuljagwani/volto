import React from 'react';
import { Button, Dropdown } from 'semantic-ui-react';
import moreSVG from '@plone/volto/icons/more.svg';
import { Icon } from '@plone/volto/components';
import config from '@plone/volto/registry';
import cx from 'classnames';

const GroupedMenuButtons = ({
  items,
  maxSizeBeforeCollapse = 3,
  params = {},
  groupIcon = moreSVG,
  toolbarGroups = config.blocks.toolbarGroups,
  className,
}) => {
  const groups = new Map();
  const seen = [];
  const options = { isMenuShape: items.length > 1, ...params };

  toolbarGroups.forEach(({ id, title }) => {
    groups[id] = items
      .filter((renderer, i) => {
        if (renderer.extra?.group === id) {
          seen.push(i);
          return true;
        }
        return false;
      })
      .map((renderer) => [renderer(options), renderer.id])
      .filter(([res]) => !!res);
  });
  const ungrouped = items
    .filter((renderer, i) => seen.indexOf(i) === -1)
    .map((renderer) => [renderer(options), renderer.id])
    .filter(([res]) => !!res);

  // NOTE: this will reorder even if ungrouped, based on config group
  // defined order
  let allItems = []; // TODO: use reduce
  Object.keys(groups)
    .map((n) => groups[n])
    .forEach((entries) => (allItems = [...allItems, ...entries]));
  allItems = [...allItems, ...ungrouped];

  const isDropdown = allItems.length > maxSizeBeforeCollapse;

  return isDropdown ? (
    <Dropdown
      item
      icon={
        <div className="button-wrapper">
          <Button icon className={cx('group', [className])}>
            <Icon name={groupIcon} size="24px" />
          </Button>
        </div>
      }
      className={cx('grouped-buttons', [className])}
    >
      <Dropdown.Menu className="right">
        <>
          {Object.keys(groups).map((groupName) => {
            const results = groups[groupName];
            const { title } = config.blocks.toolbarGroups.find(
              (g) => g.id === groupName,
            );

            return results.length > 0 ? (
              <>
                <Dropdown.Header content={title} />
                <Dropdown.Menu scrolling>
                  {results.map(([res, id]) => (
                    <React.Fragment key={id}>{res}</React.Fragment>
                  ))}
                </Dropdown.Menu>
              </>
            ) : null;
          })}
          {ungrouped.length > 0 ? (
            <>
              {ungrouped.map(([res, id]) => (
                <Dropdown.Item key={id} className={id}>
                  {res}
                </Dropdown.Item>
              ))}
            </>
          ) : (
            ''
          )}
        </>
      </Dropdown.Menu>
    </Dropdown>
  ) : allItems.length > 0 ? (
    allItems.map(([res, id]) => <React.Fragment key={id}>{res}</React.Fragment>)
  ) : null;
};

export default GroupedMenuButtons;

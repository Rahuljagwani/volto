import React from 'react';
import { useIntl } from 'react-intl';
import schemaHero from './schema.js';
import { BlockDataForm } from '@plone/volto/components';

const HeroBlockData = (props) => {
  const { block, data, onChangeBlock } = props;
  const intl = useIntl();
  const schema = schemaHero({ ...props, intl });

  return (
    <BlockDataForm
      block={block}
      schema={schema}
      title={schema.title}
      onChangeField={(id, value) => {
        onChangeBlock(block, {
          ...data,
          [id]: value,
        });
      }}
      formData={data}
    />
  );
};

export default HeroBlockData;
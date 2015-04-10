AdminConfig = {
  name: 'EsSearch',
  adminEmails: ['jvercout@theassets.co'],
  collections: {
    Category: {
      tableColumns: [
        {label: 'Title', name: 'title'},
        {label: 'ModifiedAt', name: 'modifiedAt'}
      ],
      icon: 'list',
      label: 'Categories'
    },
    Market: {
      tableColumns: [
        {label: 'Title', name: 'title'}
      ],
      icon: 'list',
      label: 'Markets'
    },
    Asset: {
      auxCollections: ['Category'],
      tableColumns: [
        {label: 'Title', name: 'title'},
        {label: 'Typology', name: 'category', collection: 'Category', collection_property: 'title'},
        {label: 'ModifiedAt', name: 'modifiedAt'}
      ],
      icon: 'list',
      label: 'Assets'
    }
  },
  autoForm: {
    omitFields: ['modifiedAt', 'status']
  }
};

//AdminDashboard.addSidebarItem('Elasticsearch', AdminDashboard.path('/elasticsearch'), {icon: 'search'});

%global project       RedhatInsights
%global repo          insights-ocp-api
%global commit        v0.0.1
%global shortcommit   %(c=%{commit}; echo ${c:0:7})
%define debug_package %{nil}

Name:           insights-ocp-api
Version:        0.0.1
Release:        3%{?dist}
Summary:        Insights API for Openshift Container Platform Image scanning
License:        ASL 2.0
URL:            https://github.com/redhatinsights/insights-ocp-api
Source0:        https://github.com/%{project}/%{repo}/archive/%{commit}/%{repo}-%{version}.tar.gz


%description
Insights API for Openshift Container Platform Image scanning

%prep
%setup -qn %{name}

%build
%{__rm} -f .gitignore

%install
mkdir -p %{buildroot}/opt/insights-ocp-api
cp -r ./ %{buildroot}/opt/insights-ocp-api


%files
#%doc LICENSE README.md
/opt/insights-ocp-api



%clean
rm -rf %{buildroot}


%changelog
* Wed May 08 2018 Lindani Phiri <lphiri@redhat.com> - 0.0.1-3
- Missing soure files

* Tue May 08 2018 Lindani Phiri <lphiri@redhat.com> - 0.0.1-2
- Address RPM diff issues

* Wed May 02 2018 Lindani Phiri <lphiri@redhat.com> - 0.0.1-1
- Initial Release

* Wed Apr 25 2018 Lindani Phiri <lphiri@redhat.com> - 0.0.1-0.alpha1
- Initial Build (Alpha)

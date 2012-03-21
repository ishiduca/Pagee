package Pagee;
use Dancer ':syntax';
use utf8;
use Encode      qw(decode_utf8);
use URI::Escape qw(uri_escape_utf8);
use File::Spec;

our $VERSION = '0.01';

sub file_search {
    my($cb, $dir) = @_;

    opendir my $dh, $dir or die qq("${dir}"can not opendir $!);
    foreach my $file (sort{ uc $a cmp uc $b }(readdir $dh)) {
        $file = decode_utf8 $file;
        $cb->("${dir}/${file}");
    }
    closedir $dh;
}

sub esc {
    uri_escape_utf8 shift, "^/A-Za-z0-9\-_.";
}


get '/' => sub {
    my $images_dir = File::Spec->catdir('public', 'images');
    my @dirs       = ();

    file_search(sub {
        my $path = shift;
        if (-d $path && $path !~ m{/\.+$}i) {
            my $dir_path = {};

            $path =~ s|^public/images||;
            $dir_path->{href} = esc($path);


            $path =~ s|^/||;
            $dir_path->{text} = $path;

            push @dirs, $dir_path;
        }
    }, $images_dir);


    template 'index' => {
        title        => 'index',
        stylesheet   => [
            '/css/normalize.css',
            '/css/index.css',
        ],
        js           => [
            '/js/lib.js',
            '/js/index.js',
        ],
        dirs         => [ @dirs ],
    };
};

get '/:name' => sub {
    my $name        = param('name');
    my $images_dir  = File::Spec->catdir('public', 'images', $name);
    my @images_path = ();

    file_search(sub {
        my $path = shift;
        if (-f $path && $path =~ m{.+\.(jp(e)?g|png|gif)$}i) {
            $path =~ s/^public//;
            push @images_path, esc($path);
        }
    }, $images_dir);


    template 'page' => {
        title       => $name,
        stylesheet  => [
            '/css/normalize.css',
            '/css/page.css',
        ],
        js          => [
            '/js/lib.js',
            '/js/page.js',
        ],
        images_path => [ @images_path ],
    };

};

any qr{.*} => sub {
    my $path = request->path;
    status 'not_found';
    template 'special_404' => {
        title      => "404: &quot;${path}&quot; not found",
        stylesheet => [
            '/css/normalize.css',
            '/css/error.css',
        ],
        path       => $path,
    };
};

1;

